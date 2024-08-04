import { IFlightSummary } from './flights.interface.ts';

interface ISerpApiFlightsResponseSearchMetadata {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_flights_url: string;
    raw_html_file: string;
    prettify_html_file: string;
    total_time_taken: number;
}
interface ISerpApiFlightsResponseSearchParameters {
    engine: string;
    hl: string;
    gl: string;
    departure_id: string;
    arrival_id: string;
    outbound_date: string;
    return_date: string;
}
interface ISerpApiFlightsResponsePriceInsights {
    lowest_price: number;
    price_level: string;
    typical_price_range: number[];
}

export interface ISerpApiFlightsResponseFightsDetails {
    departure_airport: {
        name: string;
        id: string;
        time: string;
    };
    arrival_airport: {
        name: string;
        id: string;
        time: string;
    };
    duration: number;
    airplane: string;
    airline: string;
    airline_logo: string;
    travel_class: string;
    flight_number: string;
    legroom: string;
    extensions: string[];
}
interface ISerpApiFlightsResponseFightsLayovers {
    duration: number;
    name: string;
    id: string;
}

export interface ISerpApiFlightsResponseFights {
    flights: ISerpApiFlightsResponseFightsDetails[];
    layovers: ISerpApiFlightsResponseFightsLayovers[];
    total_duration: number;
    carbon_emissions: {
        this_flight: number;
    };
    price: number;
    type: string;
    airline_logo: string;
    departure_token: string;
}

export interface ISerpApiFlightsResponse {
    search_metadata: ISerpApiFlightsResponseSearchMetadata;
    search_parameters: ISerpApiFlightsResponseSearchParameters;
    best_flights?: ISerpApiFlightsResponseFights[];
    other_flights: ISerpApiFlightsResponseFights[];
    price_insights: ISerpApiFlightsResponsePriceInsights;
}

export interface ISerpApiFlightsRequestParams {
    engine: 'google_flights';
    departure_id: string;
    arrival_id: string;
    date: string;
    outbound_date: string;
    return_date: string;
    api_key: string;
}

export interface SerpApiSearchFlightsParams {
    from: string;
    to: string;
    date: string;
    returnDate: string;
}
export interface SerpApiFlightsResponse {
    bestFlights: IFlightSummary[][];
    otherFlights: IFlightSummary[][];
}
