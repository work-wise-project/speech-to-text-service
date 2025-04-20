import express, { NextFunction, Request, Response } from 'express';
import { createServer as createHttpsServer } from 'https';
import { createMainRouter } from './routers';
import { getConfig } from './services';

export const startServer = () => {
    const app = express();
    const { port, isProductionEnv, httpsCert, httpsKey } = getConfig();

    app.use(express.json());

    app.use('/api', createMainRouter());

    app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.status(500).send({ message: 'Internal server error' });
        console.log(error.message);
    });

    const serverToRun = isProductionEnv ? createHttpsServer({ key: httpsKey, cert: httpsCert }, app) : app;
    const server = serverToRun.listen(port, () => {
        console.log(`listening on port ${port} (${isProductionEnv ? 'https' : 'http'})`);
    });

    return { app, server };
};
