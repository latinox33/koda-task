import type { Request, Response } from 'express';
import { llmService } from '../../../services/LLM.service.ts';
import { getFlightsAnalysisPrompt, getFlightsSummaryPrompt } from '../../../utils/analysis.prompt.ts';
import { IFlight, IFlightInfo, IFlightSummary } from '../../../interfaces/flights.interface.ts';
import { flightService } from '../../../services/flights.service.ts';

export const getFlightsAction = async (req: Request, res: Response) => {
    const { promptText } = req.body;
    if (!promptText) {
        return res.sendStatus(400);
    }

    let parsedResult: IFlight;
    try {
        const analysisResult = await llmService.generateResponse(getFlightsAnalysisPrompt(promptText));
        parsedResult = JSON.parse(analysisResult) as IFlight;
    } catch (e) {
        console.error('Parse error', e);
        return res.json({ status: 'Error', message: 'Error :(' });
    }

    if (!parsedResult.isValidQuery) {
        const message =
            parsedResult.suggestion ||
            'Przepraszam, nie udało mi się zinterpretować Twojego zapytania o lot z Wrocławia. Czy możesz podać więcej szczegółów?';
        return res.json({ status: 'Invalid', message: message });
    }

    if (parsedResult.missingInfo.length) {
        const message = `Aby pomóc Ci znaleźć lot, potrzebuję jeszcze następujących informacji: ${parsedResult.missingInfo.join(', ')}. ${parsedResult.suggestion}`;
        return res.json({ status: 'Missing', message: message });
    }

    const flightInfo: IFlightInfo = {
        destination: parsedResult.destination!,
        date: parsedResult.dateModel.fullDate,
        returnDate: parsedResult.dateModel.returnFullDate,
    };

    let flights: { bestFlights: IFlightSummary[][]; otherFlights: IFlightSummary[][] };
    try {
        flights = await flightService.searchFlights(
            'WRO',
            flightInfo.destination,
            flightInfo.date,
            flightInfo.returnDate,
        );
    } catch (e) {
        console.error('Flights error', e);
        return res.json({ status: 'Error', message: 'Error flights :(' });
    }

    if (!flights.bestFlights.length && !flights.otherFlights.length) {
        const message = `Niestety, nie znaleźliśmy żadnych lotów z Wrocławia do ${flightInfo.destination} w terminie ${flightInfo.date}`;
        return res.json({ status: 'Missing', message: message });
    }

    let summaryMessage;
    try {
        summaryMessage = summaryMessage = await llmService.generateResponse(
            getFlightsSummaryPrompt(flights, flightInfo),
        );
    } catch (e) {
        console.error('Summary error', e);
        return res.json({ status: 'Error', message: 'Error summary :(' });
    }

    return res.json({ status: 'OK', message: summaryMessage });
};

export const checkHealth = async (req: Request, res: Response) => {
    return res.sendStatus(200);
};
