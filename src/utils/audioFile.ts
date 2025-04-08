import { google } from '@google-cloud/speech/build/protos/protos';
import { exec } from 'child_process';
import { unlink } from 'fs/promises';
import path from 'path';
import util from 'util';

// const encodingMap: Record<string, keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding> = {
//     pcm_s16le: 'LINEAR16',
//     mp3: 'MP3',
//     flac: 'FLAC',
//     opus: 'OGG_OPUS',
//     wav: 'LINEAR16',
// };

// const baseConfig: google.cloud.speech.v1.IRecognitionConfig = {
//     enableWordTimeOffsets: true,
//     enableAutomaticPunctuation: true,
//     enableWordConfidence: true,
//     enableSpokenPunctuation: { value: true },
//     languageCode: 'en-US',
//     model: 'video',
//     diarizationConfig: { enableSpeakerDiarization: true, minSpeakerCount: 2, maxSpeakerCount: 2 },
//     useEnhanced: true,
// };
// const defaultConfig: google.cloud.speech.v1.IRecognitionConfig = {
//     ...baseConfig,
//     encoding: 'MP3',
//     sampleRateHertz: 44100,
//     audioChannelCount: 2,
// };

// export const getAudioConfig = async (filePath: string): Promise<google.cloud.speech.v1.IRecognitionConfig> => {
//     const cmd = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of json "${filePath}"`;

//     try {
//         const { stdout } = await execPromise(cmd);
//         const { codec_name, sample_rate, channels } = JSON.parse(stdout).streams[0];

//         return {
//             ...baseConfig,
//             encoding: encodingMap[codec_name] || 'MP3',
//             sampleRateHertz: Number(sample_rate),
//             audioChannelCount: Number(channels),
//         };
//     } catch (error) {
//         return defaultConfig;
//     }
// };

export const AUDIO_CONFIG: google.cloud.speech.v1.IRecognitionConfig = {
    model: 'video',
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    audioChannelCount: 1,
    useEnhanced: true,
    diarizationConfig: { enableSpeakerDiarization: true, minSpeakerCount: 2, maxSpeakerCount: 2 },
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpokenPunctuation: { value: true },
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
    } catch (err) {
        throw new Error(`Audio conversion failed: ${err}`);
    }
};
