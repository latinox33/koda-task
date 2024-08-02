import express from 'express';
import routes from '../routes';

export function initializeWebServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api', routes);

    app.listen(port, (): void => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
