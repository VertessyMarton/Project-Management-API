import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOauthEntity1792615235322 implements MigrationInterface {
    name = 'UpdateOauthEntity1792615235322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_account" ADD "linked_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauth_account" DROP COLUMN "linked_at"`);
    }

}
