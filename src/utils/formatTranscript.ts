import { google } from '@google-cloud/speech/build/protos/protos';
import { FormattedTranscript, Word } from '../types';

const padTime = (time: number) => time.toString().padStart(2, '0');

const getTotalSeconds = (seconds: number, nanos: number) => seconds + nanos / 1e9;

const formatTime = (totalSeconds: number): string => {
    const hours = padTime(Math.floor(totalSeconds / 3600));
    const minutes = padTime(Math.floor((totalSeconds % 3600) / 60));
    const formattedSeconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');

    return `${hours}:${minutes}:${formattedSeconds}`;
};

const formatWord = ({ confidence, endTime, speakerTag, startTime, word }: google.cloud.speech.v1.IWordInfo): Word => ({
    word: word || '',
    startTime: getTotalSeconds(Number(startTime?.seconds || 0), Number(startTime?.nanos || 0)),
    endTime: getTotalSeconds(Number(endTime?.seconds || 0), Number(endTime?.nanos || 0)),
    confidence: confidence || 0,
    speakerTag: speakerTag || 0,
});

const separateTranscript = (words: Word[]): Word[][] => {
    if (words.length === 0) {
        return [];
    }

    const segments: Word[][] = [];
    let currentSegment: Word[] = [words[0]];
    let currentSpeaker = words[0].speakerTag;

    for (const word of words.slice(1)) {
        if (word.speakerTag === currentSpeaker) {
            currentSegment.push(word);
        } else {
            segments.push(currentSegment);
            currentSegment = [word];
            currentSpeaker = word.speakerTag;
        }
    }

    return segments;
};

const formatSegment = (segment: Word[]): FormattedTranscript => {
    const firstWord = segment[0];
    const lastWord = segment[segment.length - 1];

    const confidenceSum = segment.map(({ confidence }) => confidence).reduce((sum, value) => sum + value, 0);

    return {
        time: `${formatTime(firstWord.startTime)} - ${formatTime(lastWord.endTime)}`,
        confidence: Math.round((confidenceSum / segment.length) * 100) / 100,
        speaker: firstWord.speakerTag,
        text: segment.map(({ word }) => word).join(' '),
    };
};

export const formatTranscript = (results: google.cloud.speech.v1.ISpeechRecognitionResult[]): FormattedTranscript[] => {
    const words = results
        .flatMap((result) => result.alternatives?.[0]?.words || [])
        .filter((word): word is google.cloud.speech.v1.IWordInfo => !!word?.speakerTag)
        .map(formatWord);

    return separateTranscript(words).map((segment) => formatSegment(segment));
};
