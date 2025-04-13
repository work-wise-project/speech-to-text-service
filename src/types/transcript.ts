import { Alternative } from './google';

export type FormattedTranscript = {
    time: string;
    confidence: number;
    text: string;
};

export type Sentence = { [key in keyof Alternative]-?: NonNullable<Alternative[key]> };

export type RefinedTranscript = FormattedTranscript & { speaker: string };
