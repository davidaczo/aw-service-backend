import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPushTokensToUser1763721815616 implements MigrationInterface {
  name = 'AddPushTokensToUser1763721815616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "push_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "token" character varying(255) NOT NULL, "userId" uuid NOT NULL, "deviceId" character varying(255), "deviceType" character varying(50), "deviceName" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "lastUsedAt" TIMESTAMP, CONSTRAINT "PK_cdd834aa4f6dc2efd7df5041233" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_eaffa663de9ab5cbf3bbf4c46c" ON "push_token" ("userId", "deviceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae6853aba3ad5fe0b6b0db1502" ON "push_token" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfaf1e0dcf71f97f4783c6b2ba" ON "push_token" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "push_token" ADD CONSTRAINT "FK_bfaf1e0dcf71f97f4783c6b2ba4" FOREIGN KEY ("userId") REFERENCES "firebase_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "push_token" DROP CONSTRAINT "FK_bfaf1e0dcf71f97f4783c6b2ba4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfaf1e0dcf71f97f4783c6b2ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae6853aba3ad5fe0b6b0db1502"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eaffa663de9ab5cbf3bbf4c46c"`,
    );
    await queryRunner.query(`DROP TABLE "push_token"`);
  }
}
