import { BaseLanguageModelInput, BaseLanguageModelInterface } from '@langchain/core/language_models/base';
import { Runnable } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';

export type LLMType =
    | BaseLanguageModelInterface
    | Runnable<BaseLanguageModelInput, string>
    | Runnable<BaseLanguageModelInput, BaseMessage>;

export interface LLMModelConfig {
    model: string;
    embeddingsModel?: string;
    RAGScrapUrl?: string;
    maxTokens: number;
    temperature: number;
    enable?: {
        conversationChain?: boolean;
        embeddings?: boolean;
    };
}
