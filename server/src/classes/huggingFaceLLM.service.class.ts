import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import path from 'path';
import { ILLMServiceBaseClass, LLMServiceBaseClass } from './LLM-service.base.class.ts';

export interface IHuggingFaceLLMService extends ILLMServiceBaseClass {
    generateResponse(prompt: string): Promise<string>;
}

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export class HuggingFaceLLMServiceClass extends LLMServiceBaseClass<HfInference> implements IHuggingFaceLLMService {
    constructor() {
        super(new HfInference(process.env.HUGGINGFACE_API_KEY), {
            modelName: 'mistralai/Mistral-7B-Instruct-v0.2',
            maxTokens: 300,
            temperature: 0.2,
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const result = await this.model.chatCompletion({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.2,
            });
            this.logResponse(prompt as string, result.choices[0].message.content || '');
            return result.choices[0].message.content || '';
        } catch (e) {
            console.error('ERR', e);
            throw e;
        }
    }
}
