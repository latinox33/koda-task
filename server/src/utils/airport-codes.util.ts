export interface AirportDetails {
    name: string;
    country: string;
    city: string;
    iata_code: string;
    _geoloc: { lat: number; lng: number };
    links_count: number;
    objectID: string;
}

export async function fetchAirportDetailsByText<T>(searchText: string, returnFirstResult?: boolean): Promise<T> {
    const airportResponse = await fetch(
        'https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json',
    );
    const airports: AirportDetails[] = await airportResponse.json();

    const filteredAirports = airports.filter((airport) => {
        const regex = searchRegex(searchText);
        return regex.test(airport.name) || regex.test(airport.city) || regex.test(airport.iata_code);
    });
    return (returnFirstResult ? filteredAirports[0] : filteredAirports) as T;
}

const searchRegex = (searchText: string): RegExp => {
    // Remove polish chars and replace unicode
    const normalized = searchText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    return new RegExp(normalized.slice(0, 3), 'i');
};
