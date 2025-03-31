import { google } from '@google-cloud/speech/build/protos/protos';
import { FormattedTranscription } from '../types';

const padTime = (time: number) => time.toString().padStart(2, '0');

const formatTime = (seconds: number, nanos: number): string => {
    const totalSeconds = seconds + nanos / 1e9;
    const hours = padTime(Math.floor(totalSeconds / 3600));
    const minutes = padTime(Math.floor((totalSeconds % 3600) / 60));
    const formattedSeconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');

    return `${hours}:${minutes}:${formattedSeconds}`;
};

export const formatTranscriptions = (transcription: google.cloud.speech.v1.ISpeechRecognitionResult[]) =>
    transcription
        .map(({ alternatives }) => alternatives?.[0] as google.cloud.speech.v1.ISpeechRecognitionAlternative)
        .filter((alternative) => !!alternative && 'transcript' in alternative)
        .map(({ confidence, transcript, words }) => {
            if (!confidence || !transcript || !words) {
                return null;
            }

            const startWordDuration = words[0].startTime;
            const endWordDuration = words[words.length - 1].endTime;

            if (!startWordDuration || !endWordDuration) {
                return null;
            }

            const startTime = formatTime(Number(startWordDuration.seconds || 0), startWordDuration.nanos || 0);
            const endTime = formatTime(Number(endWordDuration.seconds || 0), endWordDuration.nanos || 0);
            const timeRange = `${startTime} - ${endTime}`;

            return {
                time: timeRange,
                confidence: Math.round(confidence * 100) / 100,
                text: transcript.trim(),
            };
        })
        .filter(Boolean) as FormattedTranscription[];
