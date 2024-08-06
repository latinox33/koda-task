import dotenv from 'dotenv';
import path from 'path';
import { ILLMServiceBaseClass, LLMBaseClass } from './base/LLM.base.class.ts';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { LLMModelConfig } from '../interfaces/LLM.interface.ts';
import { HfInference } from '@huggingface/inference';
import { EHuggingFaceNERModel } from '../services/LLMService.factory.ts';
import * as chrono from 'chrono-node';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * HuggingFace LLM Service class
 * to use calls and prepare results
 * by model names in config.
 *
 * You need HUGGINGFACE_API_KEY in .env
 * You need PINECONE_INDEX and PINECONE_API_KEY in .env if you use embeddings
 */
export interface IHuggingFaceLLMService extends ILLMServiceBaseClass {
    extractEntitiesFromText(text: string): Promise<{ dates: Date[]; locations: string[] }>;
}
export class LLM_HuggingFaceClass
    extends LLMBaseClass<HuggingFaceInference, HuggingFaceInferenceEmbeddings>
    implements IHuggingFaceLLMService
{
    private hfInference: HfInference;

    /**
     * In constructor initiate main LLM model and embeddings
     *
     * @param config
     */
    constructor(config: LLMModelConfig) {
        const apiKey: string | undefined = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) throw new Error('Not found API KEY');

        let model: HuggingFaceInference, embeddings: HuggingFaceInferenceEmbeddings;

        try {
            model = new HuggingFaceInference({ ...config, apiKey });
        } catch (e) {
            throw new Error(`Init LLM model error: ${e}`);
        }

        try {
            embeddings = new HuggingFaceInferenceEmbeddings({ ...config.embeddings, apiKey });
        } catch (e) {
            throw new Error(`Init Embeddings error: ${e}`);
        }

        super(model, embeddings, config);

        this.hfInference = new HfInference(apiKey);
    }

    /**
     * Main method to init call to LLM by prompt
     *
     * @param prompt
     * @param parserCallback
     */
    async call(prompt: string, parserCallback?: (t: string) => string): Promise<string> {
        try {
            const result = (await this.model.invoke(prompt, {})) || '';
            if (this.isEnableLogging) this.logResponse(result);

            return parserCallback ? parserCallback(result) : result;
        } catch (e) {
            console.error('ERR', e);
            throw e;
        }
    }

    async extractEntitiesFromText(text: string): Promise<{ dates: Date[]; locations: string[] }> {
        const result = await this.hfInference.tokenClassification({
            model: EHuggingFaceNERModel.ClarinFastPDN,
            inputs: text,
        });

        const dates = this.extractDates(text);
        const locations = this.extractLocations(result);

        return { dates, locations };
    }

    private extractLocations(nerResult: { entity_group: string; word: string }[]): string[] {
        return nerResult.filter((item) => item.entity_group === 'nam_loc_gpe_city').map((item) => item.word);
    }

    private extractDates(text: string): Date[] {
        const parsedDates = chrono.parse(text);
        return parsedDates.map((result) => result.start.date());
    }
}
