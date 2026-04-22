import {MigrationInterface, QueryRunner} from "typeorm";

export class addMediaWorkSessionEntity1776795737981 implements MigrationInterface {
    name = 'addMediaWorkSessionEntity1776795737981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_session_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "sessionId" uuid NOT NULL, "filePath" character varying(512) NOT NULL, CONSTRAINT "PK_daf5652fe606b0f207ed2cc9d5a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_017dd673e7f42060eaef82ba91" ON "work_session_media" ("sessionId") `);
        await queryRunner.query(`ALTER TABLE "work_entry_session" ADD "pauseReason" text`);
        await queryRunner.query(`ALTER TABLE "work_session_media" ADD CONSTRAINT "FK_017dd673e7f42060eaef82ba912" FOREIGN KEY ("sessionId") REFERENCES "work_entry_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_session_media" DROP CONSTRAINT "FK_017dd673e7f42060eaef82ba912"`);
        await queryRunner.query(`ALTER TABLE "work_entry_session" DROP COLUMN "pauseReason"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_017dd673e7f42060eaef82ba91"`);
        await queryRunner.query(`DROP TABLE "work_session_media"`);
    }

}
