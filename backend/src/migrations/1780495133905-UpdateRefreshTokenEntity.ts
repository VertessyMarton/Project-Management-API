import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRefreshTokenEntity1780495133905 implements MigrationInterface {
    name = 'UpdateRefreshTokenEntity1780495133905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "revoked_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."refresh_token_revoked_reason_enum" AS ENUM('rotated', 'logout', 'reuse_detected')`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "revoked_reason" "public"."refresh_token_revoked_reason_enum"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "family_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "expires_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "family_id"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "revoked_reason"`);
        await queryRunner.query(`DROP TYPE "public"."refresh_token_revoked_reason_enum"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "revoked_at"`);
    }

}
