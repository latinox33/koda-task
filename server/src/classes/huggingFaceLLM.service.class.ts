import dotenv from 'dotenv';
import path from 'path';
import { ILLMServiceBaseClass, LLMServiceBaseClass } from './LLM-service.base.class.ts';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { IRagService, RAGService } from '../services/RAG.service.ts';
import { IFlightInfo } from '../interfaces/flights.interface.ts';
import { LLMModelConfig } from '../interfaces/llm.interface.ts';

export interface IHuggingFaceLLMService extends ILLMServiceBaseClass {
    call(prompt: string): Promise<string>;
    queryRAG(question: string, flightInfo: IFlightInfo): Promise<string>;
}

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * HuggingFace LLM Service class
 * to use calls and prepare results
 * by model names in config.
 *
 * You need HUGGINGFACE_API_KEY in .env
 * You need PINECONE_INDEX and PINECONE_API_KEY in .env if you use embeddings
 */
export class HuggingFaceLLMServiceClass
    extends LLMServiceBaseClass<HuggingFaceInference>
    implements IHuggingFaceLLMService
{
    private readonly ragService: IRagService | undefined;
    private readonly embeddings: HuggingFaceInferenceEmbeddings | undefined;

    /**
     * In constructor initiate main LLM model
     * and embeddings model if needed
     *
     * @param config
     */
    constructor(config: LLMModelConfig) {
        super(
            new HuggingFaceInference({
                ...config,
                apiKey: process.env.HUGGINGFACE_API_KEY,
            }),
            config,
        );

        if (config.enable?.embeddings) {
            this.embeddings = new HuggingFaceInferenceEmbeddings({
                model: config.embeddingsModel,
                apiKey: process.env.HUGGINGFACE_API_KEY,
            });
            this.ragService = new RAGService(process.env.PINECONE_INDEX!, this.model, this.embeddings, config);
            this.ragService.initialize().then().catch();
        }
    }

    /**
     * Main method to init call to LLM by prompt
     *
     * @param prompt
     */
    async call(prompt: string): Promise<string> {
        try {
            const result = await this.model.invoke(prompt, {});
            this.logResponse(prompt as string, result || '');
            return result || '';
        } catch (e) {
            console.error('ERR', e);
            throw e;
        }
    }

    /**
     * Main method to init call to conversation chain by prompt
     *
     * @doc https://v02.api.js.langchain.com/classes/langchain_chains.ConversationChain.html
     * @param prompt
     */
    async conversationCall(prompt: string): Promise<string> {
        if (!this.config.enable?.conversationChain || !this.conversationChain) {
            throw new Error('Conversation chain is not enabled');
        }
        const response = await this.conversationChain.invoke({ input: prompt });
        this.logResponse(prompt, response.response);
        const result = this.extractJsonObject(response.response);
        return result || '';
    }

    /**
     * Method to init call RAG service query
     * to fetch additional information and tips
     * for passengers
     *
     * @param question
     * @param flightInfo
     */
    async queryRAG(question: string, flightInfo: IFlightInfo): Promise<string> {
        if (!this.ragService) throw new Error('RAGService is not set');
        return await this.ragService.query(question, flightInfo);
    }

    /**
     * Weird method to fetch object string from LLM call
     * to next interpretation
     *
     * @param input
     * @private
     */
    private extractJsonObject(input: string): string | null {
        const regex = /(\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\})/;
        const match = input.match(regex);
        if (match) return match[0];

        return null;
    }
}
