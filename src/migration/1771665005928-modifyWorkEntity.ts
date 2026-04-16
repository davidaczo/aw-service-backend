import {MigrationInterface, QueryRunner} from "typeorm";

export class modifyWorkEntity1771665005928 implements MigrationInterface {
    name = 'modifyWorkEntity1771665005928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_entry" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "work_entry" ADD "categoryId" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "work_entry" DROP COLUMN "subcategoryId"`);
        await queryRunner.query(`ALTER TABLE "work_entry" ADD "subcategoryId" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_entry" DROP COLUMN "subcategoryId"`);
        await queryRunner.query(`ALTER TABLE "work_entry" ADD "subcategoryId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "work_entry" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "work_entry" ADD "categoryId" uuid NOT NULL`);
    }

}
