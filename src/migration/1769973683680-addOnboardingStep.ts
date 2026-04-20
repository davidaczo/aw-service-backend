import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOnboardingStep1769973683680 implements MigrationInterface {
  name = 'addOnboardingStep1769973683680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."firebase_user_onboardingstep_enum" AS ENUM('EMPTY', 'SET_PERSONAL_DATA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ADD "OnboardingStep" "public"."firebase_user_onboardingstep_enum" DEFAULT 'EMPTY'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "firebase_user" DROP COLUMN "OnboardingStep"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."firebase_user_onboardingstep_enum"`,
    );
  }
}
