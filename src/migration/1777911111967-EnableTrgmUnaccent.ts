import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableTrgmUnaccent1777911111967 implements MigrationInterface {
  name = 'EnableTrgmUnaccent1777911111967';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
  }
}
