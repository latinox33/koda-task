import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function initializeWebServer(): { app: Express; startServer: () => void } {
    const app = express();
    const port = process.env.SERVER_PORT || 3000;

    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const startServer = (): void => {
        app.listen(port, (): void => {
            console.log(`\x1b[0m \x1b[32m Server running at \x1b[33mhttp://localhost:${port}\x1b[0m`);
        });
    };

    return { app, startServer };
}
