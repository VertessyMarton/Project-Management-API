import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelectorToOtp1780863467437 implements MigrationInterface {
    name = 'AddSelectorToOtp1780863467437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ADD "selector" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."refresh_token_revoked_reason_enum" RENAME TO "refresh_token_revoked_reason_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."refresh_token_revoked_reason_enum" AS ENUM('rotated', 'logout', 'reset_password', 'reuse_detected')`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ALTER COLUMN "revoked_reason" TYPE "public"."refresh_token_revoked_reason_enum" USING "revoked_reason"::"text"::"public"."refresh_token_revoked_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."refresh_token_revoked_reason_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."refresh_token_revoked_reason_enum_old" AS ENUM('rotated', 'logout', 'reuse_detected')`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ALTER COLUMN "revoked_reason" TYPE "public"."refresh_token_revoked_reason_enum_old" USING "revoked_reason"::"text"::"public"."refresh_token_revoked_reason_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."refresh_token_revoked_reason_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."refresh_token_revoked_reason_enum_old" RENAME TO "refresh_token_revoked_reason_enum"`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "selector"`);
    }

}
