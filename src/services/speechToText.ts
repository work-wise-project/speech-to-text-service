import { SpeechClient } from '@google-cloud/speech';
import { AUDIO_CONFIG, formatTranscript, measureTime } from '../utils';
import { getConfig } from './config';
import { getStorageClient } from './storage';

const { googleCloudKey, googleStorageBucket, googleProjectId } = getConfig();

let client: SpeechClient;

export const getSpeechClient = () => {
    if (!client) {
        client = new SpeechClient({ keyFile: googleCloudKey, projectId: googleProjectId });
    }

    return {
        transcription: async (filePath: string) => {
            const fileName = filePath.split('\\').pop();
            if (!fileName) {
                throw new Error('file name not found');
            }

            await getStorageClient().uploadFile(filePath, fileName);

            const [response] = await measureTime('transcription', async () => {
                const [operation] = await client.longRunningRecognize({
                    audio: { uri: `gs://${googleStorageBucket}/${fileName}` },
                    config: AUDIO_CONFIG,
                });

                return await operation.promise();
            });

            return formatTranscript(response.results || []);
        },
    };
};
