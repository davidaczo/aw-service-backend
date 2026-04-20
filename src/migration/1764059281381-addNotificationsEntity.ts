import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationsEntity1764059281381 implements MigrationInterface {
  name = 'addNotificationsEntity1764059281381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_notificationtype_enum" AS ENUM('default', 'follow')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "userId" uuid NOT NULL, "notificationType" "public"."notification_notificationtype_enum" NOT NULL DEFAULT 'default', "title" character varying(255) NOT NULL, "body" text NOT NULL, "data" jsonb, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ced25315eb974b73391fb1c81" ON "notification" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_039c7fcba309434f48b3ffaa58" ON "notification" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "firebase_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_039c7fcba309434f48b3ffaa58"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ced25315eb974b73391fb1c81"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(
      `DROP TYPE "public"."notification_notificationtype_enum"`,
    );
  }
}
