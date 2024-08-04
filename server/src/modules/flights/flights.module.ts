import { Router } from 'express';
import { getFlightsAction } from './actions/get-flights.action.ts';
import { healthAction } from './actions/health.action.ts';

/**
 * Method to generate module routes
 */
function getRoutes() {
    const router = Router();

    router.get('/health', healthAction);
    router.post('/get-flights', getFlightsAction);

    return router;
}

/**
 * Main method to init module routes
 *
 * @param router
 */
export function initFlightsModule(router: Router) {
    // @todo: change to base class with init methods for future modules
    console.log('\x1b[0m\x1b[40m\x1b[33m  -- Init Flights Module\x1b[0m');
    router.use('/flights', getRoutes());
}
