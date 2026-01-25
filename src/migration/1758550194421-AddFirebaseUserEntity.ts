import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirebaseUserEntity1758550194421 implements MigrationInterface {
  name = 'AddFirebaseUserEntity1758550194421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."firebase_user_role_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "firebase_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "firebaseId" text, "email" character varying(320), "name" text, "role" "public"."firebase_user_role_enum" NOT NULL DEFAULT 'USER', "isEmailVerified" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4ca8bca675c73f95489cd75ee22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4ca8bca675c73f95489cd75ee2" ON "firebase_user" ("id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4ca8bca675c73f95489cd75ee2"`,
    );
    await queryRunner.query(`DROP TABLE "firebase_user"`);
    await queryRunner.query(`DROP TYPE "public"."firebase_user_role_enum"`);
  }
}
