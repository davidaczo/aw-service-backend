import {MigrationInterface, QueryRunner} from "typeorm";

export class addOTPCodes1764165557601 implements MigrationInterface {
    name = 'addOTPCodes1764165557601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(128) NOT NULL DEFAULT 'system', "lastChangedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(128) NOT NULL DEFAULT 'system', "email" character varying(255) NOT NULL, "code" character varying(6) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9e85e1945c47dfb71042ae5d19" ON "otp_codes" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d0e7e090f046cc9bc5a6e54a6" ON "otp_codes" ("email", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8d0e7e090f046cc9bc5a6e54a6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e85e1945c47dfb71042ae5d19"`);
        await queryRunner.query(`DROP TABLE "otp_codes"`);
    }

}
