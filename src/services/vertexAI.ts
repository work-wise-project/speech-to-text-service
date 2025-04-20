import { GenerativeModel, VertexAI } from '@google-cloud/vertexai';
import { FormattedTranscript, RefinedTranscript } from '../types';
import { getGenerateContentRequest, measureTime } from '../utils';
import { getConfig } from './config';

const { googleCloudKey, googleProjectId } = getConfig();

let client: VertexAI;
let model: GenerativeModel;

export const getVertexAIClient = () => {
    if (!client) {
        client = new VertexAI({ project: googleProjectId, googleAuthOptions: { keyFile: googleCloudKey } });
    }
    if (!model) {
        model = client.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
    }

    return {
        refineTranscript: async (transcript: FormattedTranscript[]) => {
            const { response } = await measureTime(
                'refining transcript',
                async () => await model.generateContent(getGenerateContentRequest(transcript))
            );

            return JSON.parse(response.candidates?.[0].content.parts[0].text || '') as RefinedTranscript[];
        },
    };
};
