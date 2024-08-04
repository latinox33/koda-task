import { FlightsServiceBaseClass, IFlightsServiceBaseClass } from './flights-service.base.class.ts';
import {
    ISerpApiFlightsRequestParams,
    // ISerpApiFlightsResponse,
    ISerpApiFlightsResponseFights,
    ISerpApiFlightsResponseFightsDetails,
} from '../interfaces/serp-api-flights.interface.ts';
import { getJson } from 'serpapi';
import { IFlightSummary } from '../interfaces/flights.interface.ts';

interface SerpApiSearchFlightsParams {
    from: string;
    to: string;
    date: string;
    returnDate: string;
}
interface SerpApiFlightsResponse {
    bestFlights: IFlightSummary[][];
    otherFlights: IFlightSummary[][];
}
export interface IFlightsSerpApiService extends IFlightsServiceBaseClass {
    searchFlights<T = SerpApiFlightsResponse, P = SerpApiSearchFlightsParams>(params: P): Promise<T>;
}
export class FlightsSerpApiServiceClass extends FlightsServiceBaseClass implements IFlightsSerpApiService {
    constructor() {
        super();
    }

    async searchFlights<T = Promise<SerpApiFlightsResponse>, P = SerpApiSearchFlightsParams>(_params: P): Promise<T> {
        try {
            // const { from, to, date, returnDate } = params as SerpApiSearchFlightsParams;
            //
            // const result = await this.getFlightsDetails<ISerpApiFlightsResponse>({
            //     engine: 'google_flights',
            //     departure_id: from,
            //     arrival_id: to,
            //     date: date,
            //     outbound_date: date,
            //     return_date: returnDate,
            //     api_key: process.env.SERPAPI_API_KEY!,
            // });
            //
            // if (typeof result.best_flights === 'undefined') result.best_flights = [];
            //
            // const bestFlights: IFlightSummary[][] = result.best_flights.map(this.prepareFlightsCallback);
            // const otherFlights: IFlightSummary[][] = result.other_flights.map(this.prepareFlightsCallback);
            //
            // return { bestFlights, otherFlights } as T;
            return {
                bestFlights: [
                    [
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 55,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Warsaw Chopin Airport',
                        },
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 55,
                            departure: 'Warsaw Chopin Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 60,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Warsaw Chopin Airport',
                        },
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 55,
                            departure: 'Warsaw Chopin Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 55,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Warsaw Chopin Airport',
                        },
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 55,
                            departure: 'Warsaw Chopin Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 50,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Warsaw Chopin Airport',
                        },
                        {
                            airline: 'LOT',
                            price: 152,
                            duration: 55,
                            departure: 'Warsaw Chopin Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'KLM',
                            price: 459,
                            duration: 105,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Amsterdam Airport Schiphol',
                        },
                        {
                            airline: 'KLM',
                            price: 459,
                            duration: 95,
                            departure: 'Amsterdam Airport Schiphol',
                            arrival: 'Poznań Airport',
                        },
                    ],
                ],
                otherFlights: [
                    [
                        {
                            airline: 'Lufthansa',
                            price: 732,
                            duration: 65,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Munich International Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 732,
                            duration: 65,
                            departure: 'Munich International Airport',
                            arrival: 'Berlin Brandenburg Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 732,
                            duration: 70,
                            departure: 'Berlin Brandenburg Airport',
                            arrival: 'Frankfurt Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 732,
                            duration: 75,
                            departure: 'Frankfurt Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'Lufthansa',
                            price: 784,
                            duration: 65,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Munich International Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 784,
                            duration: 70,
                            departure: 'Munich International Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'Lufthansa',
                            price: 853,
                            duration: 80,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Frankfurt Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 853,
                            duration: 55,
                            departure: 'Frankfurt Airport',
                            arrival: 'Munich International Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 853,
                            duration: 70,
                            departure: 'Munich International Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'Lufthansa',
                            price: 889,
                            duration: 80,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Frankfurt Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 889,
                            duration: 75,
                            departure: 'Frankfurt Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                    [
                        {
                            airline: 'Lufthansa',
                            price: 1777,
                            duration: 80,
                            departure: 'Wrocław Nicolaus Copernicus Airport',
                            arrival: 'Frankfurt Airport',
                        },
                        {
                            airline: 'Lufthansa',
                            price: 1777,
                            duration: 75,
                            departure: 'Frankfurt Airport',
                            arrival: 'Poznań Airport',
                        },
                    ],
                ],
            } as T;
        } catch (e) {
            console.error('Błąd podczas wyszukiwania lotów:', e);
            throw e;
        }
    }

    private async getFlightsDetails<T>(params: ISerpApiFlightsRequestParams): Promise<T> {
        return (await getJson(params)) as T;
    }

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
