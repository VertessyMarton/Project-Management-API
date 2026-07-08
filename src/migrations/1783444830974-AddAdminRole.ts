import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRole1783444830974 implements MigrationInterface {
    name = 'AddAdminRole1783444830974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."project_members_role_enum" RENAME TO "project_members_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."project_members_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer')`);
        await queryRunner.query(`ALTER TABLE "project_members" ALTER COLUMN "role" TYPE "public"."project_members_role_enum" USING "role"::"text"::"public"."project_members_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_members_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."project_members_role_enum_old" AS ENUM('owner', 'member', 'viewer')`);
        await queryRunner.query(`ALTER TABLE "project_members" ALTER COLUMN "role" TYPE "public"."project_members_role_enum_old" USING "role"::"text"::"public"."project_members_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."project_members_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."project_members_role_enum_old" RENAME TO "project_members_role_enum"`);
    }

}
