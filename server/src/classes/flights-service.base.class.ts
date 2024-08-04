export interface IFlightsServiceBaseClass {
    searchFlights<T, P>(params: P): Promise<T>;
}

/**
 * Base class for flights services
 */
export abstract class FlightsServiceBaseClass implements IFlightsServiceBaseClass {
    protected constructor() {}

    abstract searchFlights<T, P>(params: P): Promise<T>;
}
