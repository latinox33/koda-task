import { IFlightsServiceBaseClass } from '../classes/base/Flights.base.class.ts';
import { Flights_SerpAPIClass } from '../classes/Flights_SerpAPI.class.ts';

export enum EFlightsServiceType {
    SerpApi = 'serpApi',
}

/**
 * Flights service factory class with static method
 * which returns the correct service instance on type [EFlightsServiceType]
 */
class FlightsServiceFactory {
    static createService<T extends IFlightsServiceBaseClass>(type: EFlightsServiceType): T {
        switch (type) {
            case EFlightsServiceType.SerpApi:
                return new Flights_SerpAPIClass() as unknown as T;
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
    return FlightsServiceFactory.createService<T>(type);
}
