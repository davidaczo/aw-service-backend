import { getConnection, QueryRunner } from 'typeorm';

export interface ITransactionItem {
  (queryRunner: QueryRunner): Promise<any>;
}

export const inTransaction = async (
  method: ITransactionItem | ITransactionItem[] = null,
  returnIndex = -1,
): Promise<any> => {
  const queryRunner = getConnection().createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction('SERIALIZABLE');
  try {
    let returnValue: any;
    const finalize = async () => {
      await queryRunner.commitTransaction();
      return returnValue;
    };
    if (method) {
      if (Array.isArray(method)) {
        for (let i = 0; i < method.length; i += 1) {
          if (method[i]) {
            const tmp = await method[i](queryRunner);
            if (i === returnIndex) {
              returnValue = tmp;
            }
          }
        }
        return await finalize();
      } else {
        returnValue = await method(queryRunner);
        return await finalize();
      }
    }
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};
