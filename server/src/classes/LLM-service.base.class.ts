import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { BaseLanguageModelInput, BaseLanguageModelInterface } from '@langchain/core/language_models/base';
import { Runnable } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';

type LLMType =
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

export interface ILLMServiceBaseClass {
    call(prompt: string): Promise<string>;
    conversationCall(prompt: string): Promise<string>;
}

export abstract class LLMServiceBaseClass<T extends LLMType> implements ILLMServiceBaseClass {
    protected model: T;
    protected config: LLMModelConfig;
    protected memory: BufferMemory | undefined;
    protected conversationChain: ConversationChain | undefined;

    protected constructor(model: T, config: LLMModelConfig) {
        this.model = model;
        this.config = config;

        if (config.enable?.conversationChain) {
            this.memory = new BufferMemory();
            this.conversationChain = new ConversationChain({
                llm: this.model,
                memory: this.memory,
            });
        }
    }

    abstract call(prompt: string): Promise<string>;

    async conversationCall(prompt: string): Promise<string> {
        if (!this.config.enable?.conversationChain || !this.conversationChain) {
            throw new Error('Conversation chain is not enabled');
        }
        const response = await this.conversationChain.invoke({ input: prompt });
        this.logResponse(prompt, response.response);
        return response.response;
    }

    protected logResponse(_prompt: string, response: string): void {
        console.log(`
            ___ RESPONSE
            ${response}
        `);
    }

    protected clearConversationHistory(): void {
        this.memory?.clear();
    }
}
