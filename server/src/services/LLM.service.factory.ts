import { HuggingFaceLLMServiceClass } from '../classes/huggingFaceLLM.service.class.ts';
import { ILLMServiceBaseClass } from '../classes/LLM-service.base.class.ts';

export enum ELLMServiceType {
    HuggingFace = 'huggingface',
}

class LLMServiceFactory {
    static createService<T extends ILLMServiceBaseClass>(type: ELLMServiceType): T {
        switch (type) {
            case ELLMServiceType.HuggingFace:
                return new HuggingFaceLLMServiceClass() as unknown as T;
            default:
                throw new Error(`Wrong LLM service type: ${type}`);
        }
    }
}

export function initLLMService<T extends ILLMServiceBaseClass>(type: ELLMServiceType): T {
    return LLMServiceFactory.createService<T>(type);
}
