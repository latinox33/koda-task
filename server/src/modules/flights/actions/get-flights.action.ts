import type { Request, Response } from 'express';
import {
    getFlightsAnalysisPrompt,
    getFlightsSummaryPrompt,
    getSecondFlightsAnalysisPrompt,
} from '../../../utils/analysis.prompt.ts';
import { IFlight, IFlightInfo, IFlightSummary } from '../../../interfaces/flights.interface.ts';
import { ELLMServiceType, initLLMService } from '../../../services/LLM.service.factory.ts';
import { IHuggingFaceLLMService } from '../../../classes/huggingFaceLLM.service.class.ts';
import { EFlightsServiceType, initFlightsService } from '../../../services/flights.service.factory.ts';
import { IFlightsSerpApiService } from '../../../classes/flights-serp-api.service.class.ts';

export const getFlightsAction = async (req: Request, res: Response) => {
    const { promptText, isNextMessage }: { promptText: string; isNextMessage: boolean } = req.body;
    if (!promptText) {
        return res.sendStatus(400);
    }

    const llmService = initLLMService<IHuggingFaceLLMService>(ELLMServiceType.HuggingFace);
    const flightsService = initFlightsService<IFlightsSerpApiService>(EFlightsServiceType.SerpApi);

    let parsedResult: IFlight;
    try {
        const analysisPromptCallback = isNextMessage ? getSecondFlightsAnalysisPrompt : getFlightsAnalysisPrompt;
        const analysisResult = await llmService.conversationCall(analysisPromptCallback(promptText));
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
        const message =
            parsedResult.suggestion ||
            `Aby pomóc Ci znaleźć lot, potrzebuję jeszcze następujących informacji: ${parsedResult.missingInfo.join(', ')}. ${parsedResult.suggestion}`;
        return res.json({ status: 'Missing', message: message });
    }

    const flightInfo: IFlightInfo = {
        destination: parsedResult.destination!,
        date: parsedResult.dateModel.fullDate,
        returnDate: parsedResult.dateModel.returnFullDate,
    };

    let flights: { bestFlights: IFlightSummary[][]; otherFlights: IFlightSummary[][] };
    try {
        flights = await flightsService.searchFlights({
            from: 'WRO',
            to: flightInfo.destination,
            date: flightInfo.date,
            returnDate: flightInfo.returnDate,
        });
    } catch (e) {
        console.error('Flights error', e);
        return res.json({ status: 'Error', message: 'Error flights :(' });
    }

    if (!flights.bestFlights.length && !flights.otherFlights.length) {
        const message = `Niestety, nie znaleźliśmy żadnych lotów z Wrocławia do ${flightInfo.destination} w terminie ${flightInfo.date}`;
        return res.json({ status: 'Missing', message: message });
    }

    let additionalMessage: string = '';
    try {
        additionalMessage = await llmService.queryRAG('Wymień kilka informacji i porad dla podróżnych', flightInfo);
    } catch (e) {
        console.error('Prepare additional message by RAG error', e);
    }

    let summaryMessage;
    try {
        summaryMessage = summaryMessage = await llmService.call(getFlightsSummaryPrompt(flights, additionalMessage));
    } catch (e) {
        console.error('Summary error', e);
        return res.json({ status: 'Error', message: 'Error summary :(' });
    }

    return res.json({ status: 'OK', message: summaryMessage });
};

export const checkHealth = async (_req: Request, res: Response) => {
    return res.sendStatus(200);
};
