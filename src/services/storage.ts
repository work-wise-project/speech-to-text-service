import { Storage } from '@google-cloud/storage';
import { unlink } from 'fs/promises';
import { getConfig } from './config';

const { googleCloudKey, googleStorageBucket, googleProjectId } = getConfig();

let client: Storage;

export const getStorageClient = () => {
    if (!client) {
        client = new Storage({ keyFile: googleCloudKey, projectId: googleProjectId });
    }

    return {
        uploadFile: async (filePath: string, fileName: string) => {
            await client.bucket(googleStorageBucket).upload(filePath, { destination: fileName });
            console.log('file uploaded to cloud storage');

            await unlink(filePath);
            console.log('file deleted from local storage');
        },
    };
};
