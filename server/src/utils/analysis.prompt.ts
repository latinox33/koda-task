import { IFlightInfo, IFlightSummary } from '../interfaces/flights.interface.ts';

export function getFlightsAnalysisPrompt(userPrompt: string) {
    return `
        Przeanalizuj następujące zapytanie o lot z Wrocławia i wyodrębnij miejsce docelowe oraz datę (jeśli podano):
        "${userPrompt}"
    
        Jeśli zapytanie nie dotyczy lotu z Wrocławia lub brakuje kluczowych informacji, zasugeruj dopytanie o szczegóły.
        Jeżeli nie podano daty to uwzględnij najbliższy tydzień. Jeżeli nie podano miejsca docelowego to 
        zasugeruj najpopularniejsze kierunki odlotów z Wrocławia.
    
        Odpowiedz w formacie JSON:
        {
            "isValidQuery": boolean,
            "destination": string | null,
            "dateModel": {
                "date": string,
                "fullDate": string,
                "returnFullDate": string
            },
            "missingInfo": string[],
            "suggestion": string | null
        }
    
        isValidQuery - powinno wskazywać czy udało się zinterpretować zapytanie o loy z Wrocławia
        destination - powinno wskazywać kod lotniska wylotu lub lokalizację kgmid (na przykład zamiast 
            Poznań powinno być POZ, Kraków-Balice jako KRK)
        dateModel - obiekt z kilkoma parametrami. Parametr date powinien być datą, którą wyświetlę użytkownikowi więc 
            powinna być w formacie dd.mm.yyyy. Parametry fullDate oraz returnFullDate powinny być w formacie YYYY-MM-DD. 
            Jeżeli nie uda Ci się określić daty powrotu z wypowiedzi użytkownika to domyślnie wpisz tutaj 7 dni od daty fullDate.
            Parametr fullDate powinien określać datę wylotu.
        missingInfo - lista brakujących informacji
        suggestion - sugestia dopytania, jeśli potrzebne
  `;
}

export function getFlightsSummaryPrompt(
    flights: { bestFlights: IFlightSummary[][]; otherFlights: IFlightSummary[][] },
    flightInfo: IFlightInfo,
) {
    return `
        Podsumuj następujące informacje o lotach z Wrocławia do ${flightInfo.destination}:
        ${JSON.stringify(flights)}
        
        Wyniki są podzielone na dwie tablice: bestFlights oraz otherFlights. Może się zdarzyć, że bestFlights 
        będzie pustą tablicą, ale w takiej sytuacji zaproponujesz inne rozwiązania na podstawie otherFlights
        
        Utwórz krótkie, przyjazne dla użytkownika podsumowanie zawierające:
        1. Liczbę znalezionych lotów
        2. Zakres cen
        3. Najkrótszy i najdłuższy czas lotu
        4. Sugestię najlepszej opcji (np. najtańszy lub najkrótszy lot)

        Odpowiedź sformatuj w przyjazny dla użytkownika sposób.
    `;
}
