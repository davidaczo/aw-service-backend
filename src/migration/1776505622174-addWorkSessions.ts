import { MigrationInterface, QueryRunner } from 'typeorm';

export class addWorkSessions1776505622174 implements MigrationInterface {
  name = 'addWorkSessions1776505622174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."work_entry_session_status_enum" AS ENUM('STARTED', 'PAUSED', 'STOPPED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_entry_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "workEntryId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."work_entry_session_status_enum" NOT NULL DEFAULT 'STARTED', "startedAt" TIMESTAMP WITH TIME ZONE, "pausedAt" TIMESTAMP WITH TIME ZONE, "stoppedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_81aca159a82f63dcf4f39d54785" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e0fcde34c17c8a5f6ccfb41f4" ON "work_entry_session" ("workEntryId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a621927d04e3ee2ab02c8e003" ON "work_entry_session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9520f201bea1479920ad8ac284" ON "work_entry_session" ("workEntryId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_entry_status_enum" AS ENUM('TODO', 'STARTED', 'PAUSED', 'STOPPED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry" ADD "status" "public"."work_entry_status_enum" NOT NULL DEFAULT 'TODO'`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_session" ADD CONSTRAINT "FK_9520f201bea1479920ad8ac2840" FOREIGN KEY ("workEntryId") REFERENCES "work_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_session" ADD CONSTRAINT "FK_8a621927d04e3ee2ab02c8e003f" FOREIGN KEY ("userId") REFERENCES "firebase_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_entry_session" DROP CONSTRAINT "FK_8a621927d04e3ee2ab02c8e003f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_session" DROP CONSTRAINT "FK_9520f201bea1479920ad8ac2840"`,
    );
    await queryRunner.query(`ALTER TABLE "work_entry" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."work_entry_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9520f201bea1479920ad8ac284"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a621927d04e3ee2ab02c8e003"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e0fcde34c17c8a5f6ccfb41f4"`,
    );
    await queryRunner.query(`DROP TABLE "work_entry_session"`);
    await queryRunner.query(
      `DROP TYPE "public"."work_entry_session_status_enum"`,
    );
  }
}
