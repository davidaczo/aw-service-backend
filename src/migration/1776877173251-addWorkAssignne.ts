import { MigrationInterface, QueryRunner } from 'typeorm';

export class addWorkAssignne1776877173251 implements MigrationInterface {
  name = 'addWorkAssignne1776877173251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "work_entry_assignment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "workEntryId" uuid NOT NULL, "assignedUserId" uuid NOT NULL, "assignedByUserId" uuid NOT NULL, CONSTRAINT "UQ_554a673f0eb4848590abbaee418" UNIQUE ("workEntryId", "assignedUserId"), CONSTRAINT "PK_5fa963d47f44610a92a84e5d8bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_176097cc714fd69b2b735d0aea" ON "work_entry_assignment" ("assignedUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47a6774a8b7464a63a337fa39d" ON "work_entry_assignment" ("workEntryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" ADD CONSTRAINT "FK_47a6774a8b7464a63a337fa39dd" FOREIGN KEY ("workEntryId") REFERENCES "work_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" ADD CONSTRAINT "FK_176097cc714fd69b2b735d0aea0" FOREIGN KEY ("assignedUserId") REFERENCES "firebase_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" ADD CONSTRAINT "FK_2118288a9f27195408e009afa8f" FOREIGN KEY ("assignedByUserId") REFERENCES "firebase_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" DROP CONSTRAINT "FK_2118288a9f27195408e009afa8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" DROP CONSTRAINT "FK_176097cc714fd69b2b735d0aea0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" DROP CONSTRAINT "FK_47a6774a8b7464a63a337fa39dd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47a6774a8b7464a63a337fa39d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_176097cc714fd69b2b735d0aea"`,
    );
    await queryRunner.query(`DROP TABLE "work_entry_assignment"`);
  }
}
