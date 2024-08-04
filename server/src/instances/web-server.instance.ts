import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

/**
 * Method to initialize web server
 * Return app instance and method to start listen server
 */
export function initializeWebServer(): { app: Express; startServer: () => void } {
    const app = express();
    const port = process.env.SERVER_PORT || 3000;

    app.use(
        cors({
            origin: process.env.CLIENT_ORIGIN,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: ['Content-Type'],
        }),
    );
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    /**
     * Start listen server
     */
    const startServer = (): void => {
        app.listen(port, (): void => {
            console.log(`\x1b[0m \x1b[32m Server running at \x1b[33mhttp://localhost:${port}\x1b[0m`);
        });
    };

    return { app, startServer };
}
