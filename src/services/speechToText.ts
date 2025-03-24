import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
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
        transcript: async (fileLocation: string) => {
            const fileName = fileLocation.split('\\').pop();
            if (!fileName) {
                throw new Error('file name not found');
            }

            await storage.bucket(BUCKET_NAME).upload(fileLocation, { destination: fileName });
            console.log('file uploaded to Cloud Storage');

            const [operation] = await client.longRunningRecognize({
                audio: { uri: `gs://${BUCKET_NAME}/${fileName}` },
                config: {
                    model: 'latest_long',
                    encoding: 'MP3',
                    sampleRateHertz: 44100,
                    audioChannelCount: 2,
                    enableWordTimeOffsets: true,
                    enableAutomaticPunctuation: true,
                    enableWordConfidence: true,
                    enableSpokenPunctuation: { value: true },
                    languageCode: 'en-US',
                },
            });
            const [response] = await operation.promise();

            return (response.results || []).map((result) => result?.alternatives?.[0].transcript).join('\n');
        },
    };
};
