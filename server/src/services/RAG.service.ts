import { Pinecone } from '@pinecone-database/pinecone';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/dist/embeddings/hf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';
import path from 'path';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
import * as cheerio from 'cheerio';
import { IFlightInfo } from '../interfaces/flights.interface.ts';
import { LLMModelConfig } from '../interfaces/llm.interface.ts';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface IRagService {
    initialize(): Promise<void>;
    query(question: string, flightInfo: IFlightInfo): Promise<string>;
}

/**
 * RAG Service class
 * with pinecone vector store implementation
 *
 * to fetch site page content by URL
 * and use embeddings to generate message
 *
 * @doc https://js.langchain.com/v0.2/docs/tutorials/rag/
 * @doc https://docs.pinecone.io/guides/get-started/quickstart
 */
export class RAGService implements IRagService {
    private readonly indexName: string;

    private model: HuggingFaceInference;
    private pc: Pinecone;
    private embeddings: HuggingFaceInferenceEmbeddings;
    private textSplitter: RecursiveCharacterTextSplitter;
    private config: LLMModelConfig;

    /**
     * In constructor initiate pinecone vector store and text splitter instances
     *
     * @param indexName
     * @param model
     * @param embeddings
     * @param config
     */
    constructor(
        indexName: string,
        model: HuggingFaceInference,
        embeddings: HuggingFaceInferenceEmbeddings,
        config: LLMModelConfig,
    ) {
        this.pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 20,
        });
        this.indexName = indexName;
        this.model = model;
        this.embeddings = embeddings;
        this.config = config;
    }

    /**
     * Main method to initiate all process
     * fetch site page, scrap to chunks and create vector store
     */
    async initialize(): Promise<void> {
        const content = await this.scrapeWebsite(this.config.RAGScrapUrl!);
        const chunks = await this.chunkText(content);
        await this.createVectorStore(chunks);
    }

    /**
     * Method to fetch site page and parsing HTML to text
     *
     * @doc https://github.com/cheeriojs/cheerio
     * @param url
     * @private
     */
    private async scrapeWebsite(url: string): Promise<string> {
        const response = await fetch(url);
        const responseText = await response.text();
        const $ = cheerio.load(responseText);
        return $('body').text();
    }

    /**
     * Split text to chunks
     *
     * @doc https://js.langchain.com/v0.2/docs/how_to/contextual_compression/#embeddingsfilter
     * @param text
     * @private
     */
    private async chunkText(text: string): Promise<string[]> {
        return this.textSplitter.splitText(text);
    }

    /**
     * Method to create vector store
     * and return parsed embeddings for chunks
     *
     * @doc https://js.langchain.com/v0.2/docs/integrations/text_embedding/hugging_face_inference/#usage
     * @doc https://huggingface.co/blog/getting-started-with-embeddings
     * @doc https://github.com/huggingface/text-embeddings-inference
     * @doc https://docs.pinecone.io/guides/data/upsert-data
     * @doc
     * @param chunks
     * @private
     */
    private async createVectorStore(chunks: string[]): Promise<void> {
        const index = this.pc.Index(this.indexName);
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await this.embeddings.embedQuery(chunks[i]);
            await index.upsert([
                {
                    id: `chunk_${i}`,
                    values: embedding,
                    metadata: { text: chunks[i] },
                },
            ]);
        }
    }

    /**
     * Method to question embeddings
     * and init LLM model call to parse results
     *
     * @doc https://js.langchain.com/v0.2/docs/integrations/text_embedding/hugging_face_inference/#usage
     * @doc https://huggingface.co/blog/getting-started-with-embeddings
     * @doc https://github.com/huggingface/text-embeddings-inference
     * @param question
     * @param flightInfo
     */
    async query(question: string, flightInfo: IFlightInfo): Promise<string> {
        const index = this.pc.Index(this.indexName);
        const questionEmbed = await this.embeddings.embedQuery(question);

        const queryResponse = await index.namespace('ns1').query({
            vector: questionEmbed,
            topK: 3,
            includeMetadata: true,
        });
        const relevantChunks = queryResponse.matches?.map((match) => match.metadata?.text as string) || [];
        const prompt = `
            Based on the following information about a flight and general airport guidelines, provide a helpful summary for the passenger. The response should be in Polish.

            Flight Information:
            - Destination: ${flightInfo.destination}
            - Departure Date: ${flightInfo.date}
            - Return Date: ${flightInfo.returnDate}

            General Airport Information:
            ${relevantChunks.join('\n\n')}

            Please provide a summary that includes:
            1. Any specific requirements or recommendations based on the destination (e.g., passport needed for non-EU countries).
            2. Important information about check-in and security procedures.
            3. Any seasonal considerations based on the travel dates.
            4. Baggage allowance and restrictions.
            5. Any current alerts or changes in procedures at Wrocław Airport.
            6. Recommendations for arrival time at the airport.
            7. Any special services available that might be relevant to this trip.

            Format the response as a clear, concise list of points in Polish, addressing the passenger directly and focusing on the most crucial information for their specific journey.
            Answer in no more than 300 words.
        `;
        return this.model.invoke(prompt);
    }
}
