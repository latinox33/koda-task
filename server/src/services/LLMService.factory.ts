import { LLM_HuggingFaceClass } from '../classes/LLM_HuggingFace.class.ts';
import { ILLMServiceBaseClass } from '../classes/base/LLM.base.class.ts';
import { LLM_OpenAIClass } from '../classes/LLM_OpenAI.class.ts';

export enum ELLMServiceType {
    HuggingFace = 'huggingface',
    OpenAI = 'openAI',
}
export enum EHuggingFaceModel {
    Mistral7B = 'mistralai/Mistral-7B-Instruct-v0.2', // https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
    MetaLlama3_1_405B = 'meta-llama/Meta-Llama-3.1-405B', // https://huggingface.co/meta-llama/Meta-Llama-3.1-405B
}
export enum EHuggingFaceNERModel {
    Allegro_Herbert = 'allegro/herbert-base-cased', // https://huggingface.co/allegro/herbert-base-cased
    ClarinFastPDN = 'clarin-pl/FastPDN', // https://huggingface.co/clarin-pl/FastPDN
}
export enum EHuggingFaceEmbeddingsModel {
    SentenceMiniLm = 'sentence-transformers/all-MiniLM-L6-v2', // https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
}
export enum EOpenAIModel {
    GPT_3_5_Turbo = 'gpt-3.5-turbo',
    GPT_4o_mini = 'gpt-4o-mini',
    GPT_4o_mini_240718 = 'gpt-4o-mini-2024-07-18',
}
export enum EOpenAIEmbeddingsModel {
    TextEmbeddings3Large = 'text-embedding-3-large', // 3,072 dimension
    TextEmbeddings3Small = 'text-embedding-3-small', // 1,536 dimension
    TextEmbeddingsAda002 = 'text-embedding-ada-002', // 1,536 dimension
}

/**
 * LLM service factory class with static method
 * which return the correct service instance on type [ELLMServiceType]
 */
class LLMServiceFactory {
    static createService<T extends ILLMServiceBaseClass>(type: ELLMServiceType): T {
        switch (type) {
            case ELLMServiceType.HuggingFace:
                return new LLM_HuggingFaceClass({
                    model: EHuggingFaceModel.Mistral7B,
                    embeddings: {
                        model: EHuggingFaceEmbeddingsModel.SentenceMiniLm,
                        dimensions: 384,
                    },
                    // RAGScrapUrl: 'https://airport.wroclaw.pl/pasazer/odlatuje/poradnik-przed-odlotem/',
                    maxTokens: 700,
                    temperature: 0.2,
                    enable: { conversationChain: true, logResponse: true },
                }) as unknown as T;
            case ELLMServiceType.OpenAI:
                return new LLM_OpenAIClass({
                    model: EOpenAIModel.GPT_3_5_Turbo,
                    embeddings: {
                        model: EOpenAIEmbeddingsModel.TextEmbeddings3Large,
                        dimensions: 384,
                    },
                    maxTokens: 700,
                    temperature: 0.2,
                    enable: { conversationChain: true, logResponse: true },
                }) as unknown as T;
            default:
                throw new Error(`Wrong LLM service type: ${type}`);
        }
    }
}

/**
 * Factory init method to create service
 *
 * @param type
 */
export function initLLMService<T extends ILLMServiceBaseClass>(type: ELLMServiceType): T {
    return LLMServiceFactory.createService<T>(type);
}
