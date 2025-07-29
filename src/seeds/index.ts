import AppDataSource from '../datasources/data-source';

import { initSeed } from './init';

const runSeed = async () => {
  const dataSource = await AppDataSource.initialize();

  try {
    await initSeed(dataSource);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  } finally {
    await dataSource.destroy();
  }
};
void runSeed();
