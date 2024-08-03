import { Router } from 'express';
import { checkHealth, getFlightsAction } from './actions/get-flights.action.ts';

function getRoutes() {
    const router = Router();

    router.get('/health', checkHealth);
    router.post('/get-flights', getFlightsAction);

    return router;
}

export function initFlightsModule(router: Router) {
    console.log('\x1b[0m\x1b[40m\x1b[33m  -- Init Flights Module\x1b[0m');
    router.use('/flights', getRoutes());
}
