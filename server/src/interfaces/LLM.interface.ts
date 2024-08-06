import { BaseLanguageModelInput, BaseLanguageModelInterface } from '@langchain/core/language_models/base';
import { Runnable } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';
import {
    EHuggingFaceEmbeddingsModel,
    EHuggingFaceModel,
    EOpenAIEmbeddingsModel,
    EOpenAIModel,
} from '../services/LLMService.factory.ts';

export type LLMType =
    | BaseLanguageModelInterface
    | Runnable<BaseLanguageModelInput, string>
    | Runnable<BaseLanguageModelInput, BaseMessage>;

export interface LLMModelConfig {
    model: EHuggingFaceModel | EOpenAIModel;
    maxTokens: number;
    temperature: number;
    enable?: {
        conversationChain?: boolean;
        logResponse?: boolean;
    };
    embeddings: {
        model: EHuggingFaceEmbeddingsModel | EOpenAIEmbeddingsModel;
        dimensions: number;
    };
}
