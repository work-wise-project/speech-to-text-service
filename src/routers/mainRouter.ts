import { Router } from 'express';
import multer from 'multer';
import { getSpeechClient, getVertexAIClient } from '../services';
import { preprocessAudio } from '../utils';

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, 'public/');
    },
    filename: (_req, file, callback) => {
        const fileType = file.originalname.split('.').filter(Boolean).slice(1).join('.');
        const filename = `${file.originalname.split('.')[0]}.${fileType}`;

        callback(null, filename);
    },
});
const upload = multer({ storage });

export const createMainRouter = () => {
    const router = Router();

    router.post('/transcript', upload.single('file'), async (req, res) => {
        if (!req.file) {
            res.status(400).send('No file uploaded');
            return;
        }

        const processedFilePath = await preprocessAudio(req.file.path);

        const transcript = await getSpeechClient().transcription(processedFilePath);
        const refinedTranscript = await getVertexAIClient().refineTranscript(transcript);

        res.status(200).send({ transcript: refinedTranscript });
    });

    return router;
};
