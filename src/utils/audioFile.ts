import { exec } from 'child_process';
import { unlink } from 'fs/promises';
import path from 'path';
import util from 'util';
import { RecognitionConfig } from '../types';

export const AUDIO_CONFIG: RecognitionConfig = {
    model: 'latest_long',
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    audioChannelCount: 1,
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
};

export const preprocessAudio = async (filePath: string) => {
    const folder = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const wavPath = path.join(folder, `${baseName}.wav`);

    const command = [
        'ffmpeg -y',
        `-i "${filePath}"`, // input MP3 file
        '-ac 1', // mono
        '-ar 16000', // 16kHz
        '-sample_fmt s16', // 16-bit PCM
        `"${wavPath}"`, // output WAV file
    ].join(' ');

    try {
        await util.promisify(exec)(command);
        await unlink(filePath);

        return wavPath;
    } catch (error) {
        throw new Error(`Audio conversion failed: ${error}`);
    }
};
