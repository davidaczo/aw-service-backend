import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPhotoUrlToFirebaseUser1761062788341 implements MigrationInterface {
    name = 'AddPhotoUrlToFirebaseUser1761062788341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "firebase_user" ADD "photoUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "firebase_user" DROP COLUMN "photoUrl"`);
    }

}
