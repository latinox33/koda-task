import { getJson } from 'serpapi';
import { IFlightSummary } from '../interfaces/flights.interface.ts';
import dotenv from 'dotenv';
import path from 'path';
import {
    ISerpApiFlightsRequestParams,
    ISerpApiFlightsResponse,
    ISerpApiFlightsResponseFights,
    ISerpApiFlightsResponseFightsDetails,
} from '../interfaces/serp-api-flights.interface.ts';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

class FlightService {
    async searchFlights(
        from: string,
        to: string,
        date: string,
        returnDate: string,
    ): Promise<{ bestFlights: IFlightSummary[][]; otherFlights: IFlightSummary[][] }> {
        try {
            const result = await this.getFlightsDetails<ISerpApiFlightsResponse>({
                engine: 'google_flights',
                departure_id: from,
                arrival_id: to,
                date: date,
                outbound_date: date,
                return_date: returnDate,
                api_key: process.env.SERPAPI_API_KEY!,
            });
            if (typeof result.best_flights === 'undefined') result.best_flights = [];

            const bestFlights: IFlightSummary[][] = result.best_flights.map(this.prepareFlightsCallback);
            const otherFlights: IFlightSummary[][] = result.other_flights.map(this.prepareFlightsCallback);

            return { bestFlights, otherFlights };
        } catch (error) {
            console.error('Błąd podczas wyszukiwania lotów:', error);
            throw error;
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

export const flightService = new FlightService();
