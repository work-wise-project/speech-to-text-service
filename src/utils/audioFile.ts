import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';
import path from 'path';
import { RecognitionConfig } from '../types';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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

export const preprocessAudio = async (filePath: string): Promise<string> => {
    const folder = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const wavPath = path.join(folder, `${baseName}.wav`);

    return new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .audioChannels(1)
            .audioFrequency(16000)
            .audioCodec('pcm_s16le')
            .format('wav')
            .on('end', async () => {
                try {
                    await unlink(filePath);
                    resolve(wavPath);
                } catch (unlinkErr) {
                    reject(new Error(`File converted but failed to delete original: ${unlinkErr}`));
                }
            })
            .on('error', (err) => {
                reject(new Error(`Audio conversion failed: ${err.message}`));
            })
            .save(wavPath);
    });
};
