import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStatusToWorkSession1776878685392 implements MigrationInterface {
  name = 'addStatusToWorkSession1776878685392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."work_entry_assignment_status_enum" AS ENUM('PENDING', 'STARTED', 'PAUSED', 'STOPPED')`,
    );
    await queryRunner.query(`
        UPDATE "work_entry"
        SET "status" = 'STOPPED'
        WHERE "status" NOT IN ('TODO', 'STOPPED')
    `);
    await queryRunner.query(`ALTER TABLE "work_entry_assignment"
        ADD "status" "public"."work_entry_assignment_status_enum" NOT NULL DEFAULT 'PENDING'`);
    await queryRunner.query(
      `ALTER TYPE "public"."work_entry_status_enum" RENAME TO "work_entry_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_entry_status_enum" AS ENUM('TODO', 'STOPPED')`,
    );
    await queryRunner.query(`ALTER TABLE "work_entry"
        ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "work_entry" ALTER COLUMN "status" TYPE "public"."work_entry_status_enum" USING "status"::"text"::"public"."work_entry_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "work_entry"
        ALTER COLUMN "status" SET DEFAULT 'TODO'`);
    await queryRunner.query(`DROP TYPE "public"."work_entry_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."work_entry_status_enum_old" AS ENUM('TODO', 'STARTED', 'PAUSED', 'STOPPED')`,
    );
    await queryRunner.query(`ALTER TABLE "work_entry"
        ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "work_entry" ALTER COLUMN "status" TYPE "public"."work_entry_status_enum_old" USING "status"::"text"::"public"."work_entry_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "work_entry"
        ALTER COLUMN "status" SET DEFAULT 'TODO'`);
    await queryRunner.query(`DROP TYPE "public"."work_entry_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."work_entry_status_enum_old" RENAME TO "work_entry_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry_assignment" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."work_entry_assignment_status_enum"`,
    );
  }
}
