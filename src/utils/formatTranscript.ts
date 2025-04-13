import { Duration, FormattedTranscript, Sentence, SpeechRecognitionResult } from '../types';

const padTime = (time: number) => time.toString().padStart(2, '0');

const formatTime = (seconds: number, nanos: number) => {
    const totalSeconds = seconds + nanos / 1e9;
    const hours = padTime(Math.floor(totalSeconds / 3600));
    const minutes = padTime(Math.floor((totalSeconds % 3600) / 60));
    const formattedSeconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');

    return `${hours}:${minutes}:${formattedSeconds}`;
};

const formatDuration = (duration?: Duration | null) =>
    !!duration ? formatTime(Number(duration.seconds || 0), Number(duration.nanos || 0)) : '';

const formatSentence = ({ confidence, transcript, words }: Sentence): FormattedTranscript => {
    const firstWord = words[0];
    const lastWord = words[words.length - 1];

    return {
        time: `${formatDuration(firstWord.startTime)} - ${formatDuration(lastWord.endTime)}`,
        confidence: Math.round(confidence * 100) / 100,
        text: transcript.trim(),
    };
};

export const formatTranscript = (results: SpeechRecognitionResult[]): FormattedTranscript[] =>
    results
        .flatMap((result) => result.alternatives?.[0] || null)
        .filter((sentence) => !!sentence)
        .filter((sentence): sentence is Sentence => !!sentence.confidence && !!sentence.transcript && !!sentence.words)
        .map(formatSentence);
