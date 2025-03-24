import { mkdir } from 'fs/promises';
import path from 'path';
import { startServer } from './src/server';

const main = async () => {
    await mkdir(path.join(__dirname, '/public'), { recursive: true });

    startServer();
};

main();
