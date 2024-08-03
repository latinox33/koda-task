import { Router } from 'express';
import { initFlightsModule } from './flights/flights.module.ts';

export const initModules = () => {
    const router = Router();

    initFlightsModule(router);
    // @todo: add found footage movies module

    return router;
};
