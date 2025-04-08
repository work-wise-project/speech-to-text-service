export type FormattedTranscript = {
    time: string;
    confidence: number;
    text: string;
    speaker: number;
};

export type Word = {
    startTime: number;
    endTime: number;
    confidence: number;
    speakerTag: number;
    word: string;
};
