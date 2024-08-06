import type { Request, Response } from 'express';
import { EPromptName } from '../../../utils/prompt.util.ts';
import { IFlightSummary } from '../../../interfaces/flights.interface.ts';
import { ELLMServiceType, initLLMService } from '../../../services/LLMService.factory.ts';
import { IHuggingFaceLLMService } from '../../../classes/LLM_HuggingFace.class.ts';
import { EFlightsServiceType, initFlightsService } from '../../../services/FlightsService.factory.ts';
import { IFlightsSerpApiService } from '../../../classes/Flights_SerpAPI.class.ts';
import { analyzeUserPrompt } from '../handlers/analyze-user-prompt.handler.ts';
import { IRAGService, RAGService } from '../../../services/RAGService.ts';
import {
    EPineconeIndexMetric,
    EPineconeServerlessCloud,
    EPineconeServerlessRegion,
} from '../../../interfaces/pinecone.inteface.ts';
import { simpleTextParserToFirstHumanParagraph } from '../../../utils/response-parser.util.ts';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

/**
 * POST
 * Action to prepare user prompt to search flights from Wroclaw
 * and return message with summary or suggestion to get more information
 *
 * @param req
 * @param res
 */
export const getFlightsAction = async (req: Request, res: Response) => {
    const { promptText, isNextMessage }: { promptText: string; isNextMessage: boolean } = req.body;
    if (!promptText) {
        return res.status(400).json({ status: 'Invalid', message: 'No message??' });
    }

    let llmService: IHuggingFaceLLMService, flightsService: IFlightsSerpApiService, ragService: IRAGService;

    try {
        llmService = initLLMService<IHuggingFaceLLMService>(ELLMServiceType.HuggingFace);
        flightsService = initFlightsService<IFlightsSerpApiService>(EFlightsServiceType.SerpApi);
        ragService = new RAGService(llmService.getEmbeddingsModel<HuggingFaceInferenceEmbeddings>(), {
            textSplitter: {
                chunkSize: 300,
                chunkOverlap: 20,
            },
            pinecone: {
                name: process.env.PINECONE_INDEX!,
                dimension: 384,
                metric: EPineconeIndexMetric.COSINE,
                spec: {
                    serverless: {
                        cloud: EPineconeServerlessCloud.AWS,
                        region: EPineconeServerlessRegion.EU_WEST_2,
                    },
                },
            },
        });
    } catch (e) {
        console.error('Init services error', e);
        return res.json({ status: 'Error', message: 'Services down :(' });
    }
    if (!isNextMessage) llmService.clearMemory();

    const { isAirportRelatedQuestion } = analyzeUserPrompt(promptText);
    if (isAirportRelatedQuestion) {
        // uncomment to fill pinecone vector store
        // await ragService.createChunksByUrl('https://airport.wroclaw.pl/pasazer/odlatuje/poradnik-przed-odlotem/', true);

        const queryResponseToAnalyze = await ragService.queryChunks(promptText);
        if (queryResponseToAnalyze.length) {
            try {
                const promptTemplate = await llmService.prepareChatPromptTemplate(
                    EPromptName.SUMMARY_AIRPORT_RELATED_QUESTION,
                    { context: queryResponseToAnalyze.join('\n\n') },
                );
                const airportRelatedQuestionResponse = await llmService.conversationCall(
                    promptText,
                    simpleTextParserToFirstHumanParagraph,
                    promptTemplate,
                );
                return res.json({ status: 'OK', message: airportRelatedQuestionResponse });
            } catch (e) {
                console.error(e);
                return res.json({
                    status: 'Error',
                    message: 'Przepraszam, ale nie udało mi się znaleźć informacji. Sformułuj inaczej pytanie',
                });
            }
        }
    }

    const { dates, locations } = await llmService.extractEntitiesFromText(promptText);
    if (!dates.length || !locations.length) {
        return res.json({
            status: 'Invalid',
            message: 'Proszę, podaj informację o miejscu, do którego chcesz lecieć oraz dacie odlotu',
        });
    }

    let airportCode: string, outboundDate: string;

    try {
        airportCode = await flightsService.recognizeAirportIataCodeByLocationString(locations[0]);
    } catch (e) {
        console.error(e);
        return res.json({ status: 'Error', message: 'Nie udało mi się odnaleźć lotniska w tym miejscu.' });
    }

    try {
        outboundDate = flightsService.validateRecognizedDates(dates[0]);
    } catch (e) {
        console.error(e);
        return res.json({ status: 'Error', message: 'Przepraszam, ale nie mamy wehikułu czasu :(' });
    }

    let flights: { bestFlights: IFlightSummary[][]; otherFlights: IFlightSummary[][] };
    try {
        flights = await flightsService.searchFlights({
            from: 'WRO',
            to: airportCode,
            date: outboundDate,
        });

        // mock - to Berlin 21.08.2024
        // flights = JSON.parse('{"bestFlights":[[{"airline":"Lufthansa","price":893,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Brussels Airlines","price":893,"duration":70,"departure":"Frankfurt Airport","arrival":"Brussels Airport"},{"airline":"United","price":893,"duration":475,"departure":"Brussels Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":981,"duration":65,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Munich International Airport"},{"airline":"Lufthansa","price":981,"duration":520,"departure":"Munich International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":984,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"United","price":984,"duration":510,"departure":"Frankfurt Airport","arrival":"Newark Liberty International Airport"}]],"otherFlights":[[{"airline":"Lufthansa","price":856,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Air Canada","price":856,"duration":475,"departure":"Frankfurt Airport","arrival":"Montréal-Pierre Elliott Trudeau International Airport"},{"airline":"United","price":856,"duration":103,"departure":"Montréal-Pierre Elliott Trudeau International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Air Dolomiti","price":856,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":856,"duration":465,"departure":"Frankfurt Airport","arrival":"Montréal-Pierre Elliott Trudeau International Airport"},{"airline":"United","price":856,"duration":103,"departure":"Montréal-Pierre Elliott Trudeau International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":862,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Air Canada","price":862,"duration":530,"departure":"Frankfurt Airport","arrival":"Toronto Pearson International Airport"},{"airline":"Air Canada","price":862,"duration":98,"departure":"Toronto Pearson International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"SWISS","price":865,"duration":95,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Zurich Airport"},{"airline":"United","price":865,"duration":550,"departure":"Zurich Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Air Dolomiti","price":873,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":873,"duration":510,"departure":"Frankfurt Airport","arrival":"Boston Logan International Airport"},{"airline":"United","price":873,"duration":102,"departure":"Boston Logan International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":873,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"United","price":873,"duration":535,"departure":"Frankfurt Airport","arrival":"Dulles International Airport"},{"airline":"United","price":873,"duration":77,"departure":"Dulles International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":875,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Air Canada","price":875,"duration":475,"departure":"Frankfurt Airport","arrival":"Montréal-Pierre Elliott Trudeau International Airport"},{"airline":"Air Canada","price":875,"duration":99,"departure":"Montréal-Pierre Elliott Trudeau International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":884,"duration":65,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Munich International Airport"},{"airline":"Lufthansa","price":884,"duration":90,"departure":"Munich International Airport","arrival":"Leonardo da Vinci–Fiumicino Airport"},{"airline":"United","price":884,"duration":570,"departure":"Leonardo da Vinci–Fiumicino Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":884,"duration":65,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Munich International Airport"},{"airline":"Brussels Airlines","price":884,"duration":85,"departure":"Munich International Airport","arrival":"Brussels Airport"},{"airline":"United","price":884,"duration":505,"departure":"Brussels Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":887,"duration":65,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Munich International Airport"},{"airline":"Lufthansa","price":887,"duration":60,"departure":"Munich International Airport","arrival":"Frankfurt Airport"},{"airline":"United","price":887,"duration":510,"departure":"Frankfurt Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Air Dolomiti","price":892,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":892,"duration":55,"departure":"Frankfurt Airport","arrival":"Munich International Airport"},{"airline":"Lufthansa","price":892,"duration":520,"departure":"Munich International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":893,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":893,"duration":60,"departure":"Frankfurt Airport","arrival":"Brussels Airport"},{"airline":"United","price":893,"duration":505,"departure":"Brussels Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":893,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":893,"duration":60,"departure":"Frankfurt Airport","arrival":"Brussels Airport"},{"airline":"United","price":893,"duration":505,"departure":"Brussels Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":900,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":900,"duration":80,"departure":"Frankfurt Airport","arrival":"Venice Marco Polo Airport"},{"airline":"United","price":900,"duration":580,"departure":"Venice Marco Polo Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Lufthansa","price":973,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Air Canada","price":973,"duration":475,"departure":"Frankfurt Airport","arrival":"Montréal-Pierre Elliott Trudeau International Airport"},{"airline":"Air Canada","price":973,"duration":99,"departure":"Montréal-Pierre Elliott Trudeau International Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"Air Dolomiti","price":1121,"duration":80,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Frankfurt Airport"},{"airline":"Lufthansa","price":1121,"duration":500,"departure":"Frankfurt Airport","arrival":"Newark Liberty International Airport"}],[{"airline":"LOT","price":1529,"duration":60,"departure":"Wrocław Nicolaus Copernicus Airport","arrival":"Warsaw Chopin Airport"},{"airline":"LOT","price":1529,"duration":560,"departure":"Warsaw Chopin Airport","arrival":"Newark Liberty International Airport"}]]}');
    } catch (e) {
        console.error('Flights error', e);
        return res.json({ status: 'Error', message: 'Error flights :(' });
    }

    if (!flights.bestFlights.length && !flights.otherFlights.length) {
        return res.json({
            status: 'Missing',
            message: `Niestety, nie znaleźliśmy żadnych lotów z Wrocławia do ${airportCode} w terminie ${outboundDate}`,
        });
    }

    try {
        const promptTemplate = await llmService.prepareChatPromptTemplate(EPromptName.SUMMARY_FOUND_FLIGHTS, {
            context: JSON.stringify(flights).replace(/"/g, '\\"'),
        });
        const summaryResponse = await llmService.conversationCall(
            promptText,
            simpleTextParserToFirstHumanParagraph,
            promptTemplate,
        );
        return res.json({ status: 'OK', message: summaryResponse });
    } catch (e) {
        console.error('Flights error', e);
        return res.json({ status: 'Error', message: 'Error flights :(' });
    }
};
