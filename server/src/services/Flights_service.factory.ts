import { IFlightsServiceBaseClass } from '../classes/Flights.base.class.ts';
import { Flights_service_serpapiClass } from '../classes/Flights_service_serpapi.class.ts';

export enum EFlightsServiceType {
    SerpApi = 'serpApi',
}

/**
 * Flights service factory class with static method
 * which returns the correct service instance on type [EFlightsServiceType]
 */
class Flights_serviceFactory {
    static createService<T extends IFlightsServiceBaseClass>(type: EFlightsServiceType): T {
        switch (type) {
            case EFlightsServiceType.SerpApi:
                return new Flights_service_serpapiClass() as unknown as T;
            default:
                throw new Error(`Wrong Flights service type: ${type}`);
        }
    }
}

/**
 * Factory init method to create service
 *
 * @param type
 */
export function initFlightsService<T extends IFlightsServiceBaseClass>(type: EFlightsServiceType): T {
    return Flights_serviceFactory.createService<T>(type);
}
