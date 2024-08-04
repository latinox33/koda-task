import { IFlightsServiceBaseClass } from '../classes/flights-service.base.class.ts';
import { FlightsSerpApiServiceClass } from '../classes/flights-serp-api.service.class.ts';

export enum EFlightsServiceType {
    SerpApi = 'serpApi',
}

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

export function initFlightsService<T extends IFlightsServiceBaseClass>(type: EFlightsServiceType): T {
    return FlightsServiceFactory.createService<T>(type);
}
