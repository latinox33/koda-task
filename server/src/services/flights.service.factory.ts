import { IFlightsServiceBaseClass } from '../classes/flights-service.base.class.ts';
import { FlightsSerpApiServiceClass } from '../classes/flights-serp-api.service.class.ts';

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
                return new FlightsSerpApiServiceClass() as unknown as T;
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
