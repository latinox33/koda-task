import { ILLMServiceBaseClass, LLMBaseClass } from './base/LLM.base.class.ts';
import dotenv from 'dotenv';
import path from 'path';
import { LLMModelConfig } from '../interfaces/LLM.interface.ts';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface IOpenAILLMService extends ILLMServiceBaseClass {}
export class LLM_OpenAIClass extends LLMBaseClass<ChatOpenAI, OpenAIEmbeddings> implements IOpenAILLMService {
    constructor(config: LLMModelConfig) {
        const apiKey: string | undefined = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('Not found API KEY');

        let model: ChatOpenAI, embeddings: OpenAIEmbeddings;

        try {
            model = new ChatOpenAI({ ...config, apiKey });
        } catch (e) {
            throw new Error(`Init LLM model error: ${e}`);
        }

        try {
            embeddings = new OpenAIEmbeddings({ ...config.embeddings, apiKey });
        } catch (e) {
            throw new Error(`Init Embeddings error: ${e}`);
        }

        super(model, embeddings, config);
    }

    async call(_prompt: string, _parserCallback?: (t: string) => string): Promise<string> {
        return Promise.resolve('');
    }
}
