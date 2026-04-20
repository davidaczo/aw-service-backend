import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompletedOnboardingStep1770580342371
  implements MigrationInterface
{
  name = 'AddCompletedOnboardingStep1770580342371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."firebase_user_onboardingstep_enum" RENAME TO "firebase_user_onboardingstep_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."firebase_user_onboardingstep_enum" AS ENUM('EMPTY', 'SET_PERSONAL_DATA', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ALTER COLUMN "OnboardingStep" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ALTER COLUMN "OnboardingStep" TYPE "public"."firebase_user_onboardingstep_enum" USING "OnboardingStep"::"text"::"public"."firebase_user_onboardingstep_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ALTER COLUMN "OnboardingStep" SET DEFAULT 'EMPTY'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."firebase_user_onboardingstep_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."firebase_user_onboardingstep_enum_old" AS ENUM('EMPTY', 'SET_PERSONAL_DATA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ALTER COLUMN "OnboardingStep" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ALTER COLUMN "OnboardingStep" TYPE "public"."firebase_user_onboardingstep_enum_old" USING "OnboardingStep"::"text"::"public"."firebase_user_onboardingstep_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "firebase_user" ALTER COLUMN "OnboardingStep" SET DEFAULT 'EMPTY'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."firebase_user_onboardingstep_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."firebase_user_onboardingstep_enum_old" RENAME TO "firebase_user_onboardingstep_enum"`,
    );
  }
}
