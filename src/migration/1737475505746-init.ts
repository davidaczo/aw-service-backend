import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1737475505746 implements MigrationInterface {
  name = 'init1737475505746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "email" character varying(320), "password" character varying(256), "firstName" character varying(32), "lastName" character varying(32), "searchValue" text NOT NULL, "passwordResetToken" character varying(128), "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "secondFactorEnabled" boolean NOT NULL DEFAULT false, "secondFactorSecret" character varying(32), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cace4a159ff9f2512dd4237376" ON "user" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "accessTokenExpiration" TIMESTAMP WITH TIME ZONE NOT NULL, "refreshTokenExpiration" TIMESTAMP WITH TIME ZONE NOT NULL, "lastUsed" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "operatingSystem" text, "browser" text, "ipAddress" text, "country" text, "city" text, "userId" uuid NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f55da76ac1c3ac420f444d2ff1" ON "session" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tfa_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "expiration" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_09e0cb7c08d7d65d7146229ad35" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09e0cb7c08d7d65d7146229ad3" ON "tfa_session" ("id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tfa_session" ADD CONSTRAINT "FK_db1312747a4fdd89848e8891d25" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tfa_session" DROP CONSTRAINT "FK_db1312747a4fdd89848e8891d25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09e0cb7c08d7d65d7146229ad3"`,
    );
    await queryRunner.query(`DROP TABLE "tfa_session"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f55da76ac1c3ac420f444d2ff1"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cace4a159ff9f2512dd4237376"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
