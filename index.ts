import { mkdir } from 'fs/promises';
import path from 'path';
import { startServer } from './src/server';
import { checkAuthConnection } from './src/utils';

const main = async () => {
    await mkdir(path.join(__dirname, '/public'), { recursive: true });
    await checkAuthConnection();

    startServer();
};

main();
