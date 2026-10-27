import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogEntity1792871428418 implements MigrationInterface {
    name = 'CreateAuditLogEntity1792871428418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" SERIAL NOT NULL, "occured_at" TIMESTAMP NOT NULL DEFAULT now(), "category" character varying NOT NULL, "action" character varying NOT NULL, "actorId" integer, "targetType" character varying, "target_id" integer, "outcome" character varying NOT NULL, "metadata" jsonb NOT NULL, "request_id" character varying, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }

}
