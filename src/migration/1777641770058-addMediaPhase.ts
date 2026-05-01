import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMediaPhase1777641770058 implements MigrationInterface {
  name = 'addMediaPhase1777641770058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."work_session_media_phase_enum" AS ENUM('START', 'END')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_session_media" ADD "phase" "public"."work_session_media_phase_enum" NOT NULL DEFAULT 'START'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_session_media" DROP COLUMN "phase"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."work_session_media_phase_enum"`,
    );
  }
}
