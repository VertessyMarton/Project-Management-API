import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOAuthEntity1781206240121 implements MigrationInterface {
    name = 'AddOAuthEntity1781206240121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "oauth_account" ("id" SERIAL NOT NULL, "provider" character varying NOT NULL, "provider_user_id" character varying NOT NULL, "email" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_01ec7d2a8273dcaaed3dd10a4fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4d4b3c6d56062edb4087939e9a" ON "oauth_account" ("provider", "provider_user_id") `);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "oauth_account" ADD CONSTRAINT "FK_e355ddb0b69b083cbf253345d1c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_account" DROP CONSTRAINT "FK_e355ddb0b69b083cbf253345d1c"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d4b3c6d56062edb4087939e9a"`);
        await queryRunner.query(`DROP TABLE "oauth_account"`);
    }

}
