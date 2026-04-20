import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkEntry1771664621261 implements MigrationInterface {
  name = 'AddWorkEntry1771664621261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "work_entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "userId" uuid NOT NULL, "categoryId" uuid NOT NULL, "subcategoryId" uuid NOT NULL, "clientName" character varying(255) NOT NULL, "machineName" character varying(255) NOT NULL, "machineModel" character varying(255) NOT NULL, "manufacturingYear" integer NOT NULL, "serialNumber" character varying(255) NOT NULL, "operatingHours" integer NOT NULL, "hectares" numeric(10,2) NOT NULL, CONSTRAINT "PK_b570ae12e64fc2bb2387924c072" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c22e7c24232dbbf2b37495e9da" ON "work_entry" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72a957ccd3a81888b54bd1d3ae" ON "work_entry" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "work_entry" ADD CONSTRAINT "FK_72a957ccd3a81888b54bd1d3ae8" FOREIGN KEY ("userId") REFERENCES "firebase_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_entry" DROP CONSTRAINT "FK_72a957ccd3a81888b54bd1d3ae8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_72a957ccd3a81888b54bd1d3ae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c22e7c24232dbbf2b37495e9da"`,
    );
    await queryRunner.query(`DROP TABLE "work_entry"`);
  }
}
