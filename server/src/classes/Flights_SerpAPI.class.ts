import { FlightsBaseClass, IFlightsServiceBaseClass } from './base/Flights.base.class.ts';
import {
    ISerpApiFlightsRequestParams,
    ISerpApiFlightsResponse,
    ISerpApiFlightsResponseFights,
    ISerpApiFlightsResponseFightsDetails,
    SerpApiFlightsResponse,
    SerpApiSearchFlightsParams,
} from '../interfaces/serp-api-flights.interface.ts';
import { getJson } from 'serpapi';
import { IFlightSummary } from '../interfaces/flights.interface.ts';
import { AirportDetails, fetchAirportDetailsByText } from '../utils/airport-codes.util.ts';
import { isBefore, format } from 'date-fns';

export interface IFlightsSerpApiService extends IFlightsServiceBaseClass {
    searchFlights<T = SerpApiFlightsResponse, P = SerpApiSearchFlightsParams>(params: P): Promise<T>;
    recognizeAirportIataCodeByLocationString(recognizeLocation: string): Promise<string>;
    validateRecognizedDates(date: Date): string;
}

/**
 * SerpAPI with Google Flights API class
 * to search flights.
 *
 * You need SERPAPI_API_KEY in .env
 */
export class Flights_SerpAPIClass extends FlightsBaseClass implements IFlightsSerpApiService {
    constructor() {
        super();
    }

    /**
     * Method to search flights
     * and parse results on best and other flights
     * @doc https://serpapi.com/google-flights-api
     *
     * @param params
     */
    async searchFlights<T = Promise<SerpApiFlightsResponse>, P = SerpApiSearchFlightsParams>(params: P): Promise<T> {
        try {
            const { from, to, date, returnDate }: SerpApiSearchFlightsParams = params as SerpApiSearchFlightsParams;
            const requestJsonParameters: ISerpApiFlightsRequestParams = {
                engine: 'google_flights',
                departure_id: from,
                arrival_id: to,
                date: date,
                outbound_date: date,
                type: 2, // 1 - trip (return_date is_required) | 2 - one way // @todo add recognize type
                api_key: process.env.SERPAPI_API_KEY!,
            };
            if (returnDate) requestJsonParameters.return_date = returnDate;

            // @todo: change to main engine and check env exists in constructor
            const result = await this.getFlightsDetails<ISerpApiFlightsResponse>(requestJsonParameters);

            if (typeof result.best_flights === 'undefined') result.best_flights = [];

            const bestFlights: IFlightSummary[][] = result.best_flights.map(this.prepareFlightsCallback);
            const otherFlights: IFlightSummary[][] = result.other_flights.map(this.prepareFlightsCallback);

            return { bestFlights, otherFlights } as T;
        } catch (e) {
            console.error('Błąd podczas wyszukiwania lotów:', e);
            throw e;
        }
    }

    async recognizeAirportIataCodeByLocationString(recognizeLocation: string): Promise<string> {
        const recognizeAirport = await fetchAirportDetailsByText<AirportDetails>(recognizeLocation, true);
        if (!recognizeAirport) {
            throw new Error('NO_AIRPORT_LOCATION');
        }
        return recognizeAirport.iata_code;
    }

    validateRecognizedDates(date: Date): string {
        if (isBefore(date, new Date())) {
            throw new Error('WRONG_DATE');
        }
        return format(date, 'yyyy-MM-dd');
    }

    /**
     * Get JSON result from SerpAPI by params
     * @doc https://serpapi.com/search-api
     *
     * @param params
     * @private
     */
    private async getFlightsDetails<T>(params: ISerpApiFlightsRequestParams): Promise<T> {
        return (await getJson(params)) as T;
    }

    /**
     * Method to parse SerpAPI result
     *
     * @param flights
     * @private
     */
    private prepareFlightsCallback(flights: ISerpApiFlightsResponseFights): IFlightSummary[] {
        return flights.flights.map((item: ISerpApiFlightsResponseFightsDetails): IFlightSummary => {
            return {
                airline: item.airline,
                price: flights.price,
                duration: item.duration,
                departure: item.departure_airport.name,
                arrival: item.arrival_airport.name,
            };
        });
    }
}
