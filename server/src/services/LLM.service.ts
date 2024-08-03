import dotenv from 'dotenv';
import path from 'path';
import { HfInference } from '@huggingface/inference';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export class LLMService {
    private readonly inference: HfInference;

    constructor() {
        this.inference = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const result = await this.inference.chatCompletion({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            });
            console.log(`
        __ PROMPT
        ${prompt}
        
        ___ MSG
        ${result.choices[0].message.content}
        `);
            return result.choices[0].message.content || '';
        } catch (e) {
            console.error('ERR', e);
            throw e;
        }
    }
}

export const llmService = new LLMService();
