import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1777336675256 implements MigrationInterface {
    name = 'AddIndexes1777336675256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_91256732111f039be6b212d96c" ON "comment" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f53e7ffe94530f9e0221224d2" ON "task" ("project_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1cf56b10b23971cfd07e4fc612" ON "project" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b3f491d3a3f986106d281d8eb4" ON "project_members" ("project_id", "user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b3f491d3a3f986106d281d8eb4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cf56b10b23971cfd07e4fc612"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f53e7ffe94530f9e0221224d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91256732111f039be6b212d96c"`);
    }

}
