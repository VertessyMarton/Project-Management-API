import { MigrationInterface, QueryRunner } from "typeorm";

export class DropProjectUserForeignKey1777370199056 implements MigrationInterface {
    name = 'DropProjectUserForeignKey1777370199056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_1cf56b10b23971cfd07e4fc6126"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cf56b10b23971cfd07e4fc612"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_1cf56b10b23971cfd07e4fc612" ON "project" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_1cf56b10b23971cfd07e4fc6126" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
