export interface IFlight {
    isValidQuery: boolean;
    destination: string | null;
    dateModel: {
        date?: string;
        fullDate: string;
        returnFullDate: string;
    };
    missingInfo: string[];
    suggestion: string | null;
}

export interface IFlightInfo {
    destination: string;
    date: string;
    returnDate: string;
}

export interface IFlightSummary {
    airline: string;
    price: number;
    duration: number;
    departure: string;
    arrival: string;
}
