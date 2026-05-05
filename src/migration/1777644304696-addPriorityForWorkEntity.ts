import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPriorityForWorkEntity1777644304696
  implements MigrationInterface
{
  name = 'addPriorityForWorkEntity1777644304696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."work_entry_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry" ADD "priority" "public"."work_entry_priority_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "work_entry" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "public"."work_entry_priority_enum"`);
  }
}
