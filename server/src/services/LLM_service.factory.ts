import { LLM_service_huggingFaceClass } from '../classes/LLM_service_huggingFace.class.ts';
import { ILLMServiceBaseClass } from '../classes/LLM.base.class.ts';

export enum ELLMServiceType {
    HuggingFace = 'huggingface',
}
export enum EHuggingFaceModel {
    Mistral7B = 'mistralai/Mistral-7B-Instruct-v0.2',
}
export enum EHuggingFaceEmbeddingsModel {
    SentenceMiniLm = 'sentence-transformers/all-MiniLM-L6-v2',
}

/**
 * LLM service factory class with static method
 * which return the correct service instance on type [ELLMServiceType]
 */
class LLM_serviceFactory {
    static createService<T extends ILLMServiceBaseClass>(type: ELLMServiceType): T {
        switch (type) {
            case ELLMServiceType.HuggingFace:
                return new LLM_service_huggingFaceClass({
                    model: EHuggingFaceModel.Mistral7B,
                    embeddingsModel: EHuggingFaceEmbeddingsModel.SentenceMiniLm,
                    RAGScrapUrl: 'https://airport.wroclaw.pl/pasazer/odlatuje/poradnik-przed-odlotem/',
                    maxTokens: 700,
                    temperature: 0.2,
                    enable: { conversationChain: true, embeddings: true },
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
    return LLM_serviceFactory.createService<T>(type);
}
