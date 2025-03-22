import { Router } from 'express';

export const createMainRouter = () => {
    const router = Router();

    router.get('/', (req, res) => {
        res.send('Hello, world!');
    });

    return router;
};
