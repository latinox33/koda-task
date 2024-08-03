import dotenv from 'dotenv';
import { initializeWebServer } from './instances/web-server.instance';
import path from 'path';
import { initModules } from './modules';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { app, startServer } = initializeWebServer();

app.use('/api', initModules());

startServer();
