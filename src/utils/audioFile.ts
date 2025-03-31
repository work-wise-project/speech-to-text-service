import { google } from '@google-cloud/speech/build/protos/protos';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const encodingMap: Record<string, keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding> = {
    pcm_s16le: 'LINEAR16',
    mp3: 'MP3',
    flac: 'FLAC',
    opus: 'OGG_OPUS',
    wav: 'LINEAR16',
};

const baseConfig: google.cloud.speech.v1.IRecognitionConfig = {
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpokenPunctuation: { value: true },
    languageCode: 'en-US',
    model: 'latest_long',
};
const defaultConfig: google.cloud.speech.v1.IRecognitionConfig = {
    ...baseConfig,
    encoding: 'MP3',
    sampleRateHertz: 44100,
    audioChannelCount: 2,
};

export const getAudioConfig = async (filePath: string): Promise<google.cloud.speech.v1.IRecognitionConfig> => {
    const cmd = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of json "${filePath}"`;

    try {
        const { stdout } = await execPromise(cmd);
        const { codec_name, sample_rate, channels } = JSON.parse(stdout).streams[0];

        return {
            ...baseConfig,
            encoding: encodingMap[codec_name] || 'MP3',
            sampleRateHertz: Number(sample_rate),
            audioChannelCount: Number(channels),
        };
    } catch (error) {
        return defaultConfig;
    }
};
