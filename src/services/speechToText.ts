import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import { unlink } from 'fs/promises';
import { AUDIO_CONFIG, formatTranscript } from '../utils';
import { getConfig } from './config';

const BUCKET_NAME = 'work_wise_audio_files';

const { googleCloudKey } = getConfig();

let client: SpeechClient;
let storage: Storage;

export const getGoogleCloudClient = () => {
    if (!client) {
        client = new SpeechClient({ keyFile: googleCloudKey });
    }
    if (!storage) {
        storage = new Storage({ keyFile: googleCloudKey });
    }

    return {
        transcription: async (filePath: string) => {
            const fileName = filePath.split('\\').pop();
            if (!fileName) {
                throw new Error('file name not found');
            }

            await storage.bucket(BUCKET_NAME).upload(filePath, { destination: fileName });
            console.log('file uploaded to Cloud Storage');

            await unlink(filePath);
            console.log('file deleted from local storage');

            const startTime = new Date().getTime();
            const [operation] = await client.longRunningRecognize({
                audio: { uri: `gs://${BUCKET_NAME}/${fileName}` },
                config: AUDIO_CONFIG,
            });
            const [response] = await operation.promise();
            const endTime = new Date().getTime();

            return { transcript: formatTranscript(response.results || []), time: endTime - startTime };
        },
    };
};
