import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import { formatTranscriptions, getAudioConfig } from '../utils';
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
        transcript: async (filePath: string) => {
            const fileName = filePath.split('\\').pop();
            if (!fileName) {
                throw new Error('file name not found');
            }

            await storage.bucket(BUCKET_NAME).upload(filePath, { destination: fileName });
            console.log('file uploaded to Cloud Storage');

            const [operation] = await client.longRunningRecognize({
                audio: { uri: `gs://${BUCKET_NAME}/${fileName}` },
                config: await getAudioConfig(filePath),
            });
            const [response] = await operation.promise();

            return formatTranscriptions(response.results || []);
        },
    };
};
