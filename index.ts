import { mkdir } from 'fs/promises';
import path from 'path';
import { startServer } from './src/server';
import { getConfig } from './src/services';
import { checkAuthConnection } from './src/utils';

const main = async () => {
    const { isProductionEnv } = getConfig();

    const publicFolderPath = isProductionEnv
        ? path.resolve(__dirname, '..', 'public')
        : path.resolve(__dirname, 'public');
    await mkdir(publicFolderPath, { recursive: true });

    await checkAuthConnection();

    startServer();
};

main();
