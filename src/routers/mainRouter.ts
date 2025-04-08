import { Router } from 'express';
import { unlink } from 'fs/promises';
import multer from 'multer';
import { getGoogleCloudClient } from '../services';

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, 'public/');
    },
    filename: (_req, file, callback) => {
        const fileType = file.originalname.split('.').filter(Boolean).slice(1).join('.');
        const filename = `${file.originalname.split('.')[0]}.${fileType}`;

        console.log('Original filename:', file.originalname);
        console.log('Filename:', filename);

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

        const transcript = await getGoogleCloudClient().transcription(req.file.path);

        await unlink(req.file.path);
        console.log('file deleted');

        res.status(200).send({ transcript });
        console.log(`finished transcript`);
    });

    return router;
};
