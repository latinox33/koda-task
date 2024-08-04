import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { LLMModelConfig, LLMType } from '../interfaces/llm.interface.ts';

export interface ILLMServiceBaseClass {
    call(prompt: string): Promise<string>;
    conversationCall(prompt: string): Promise<string>;
}

/**
 * Base class for LLM services
 * Can extend by any LLM type
 *
 * @doc https://js.langchain.com/v0.1/docs/modules/memory/types/buffer/
 * This class contains definitions of basic methods to support LLM
 */
export abstract class LLMBaseClass<T extends LLMType> implements ILLMServiceBaseClass {
    protected model: T;
    protected config: LLMModelConfig;
    protected memory: BufferMemory | undefined;
    protected conversationChain: ConversationChain | undefined;

    /**
     * In constructor is defined model and config
     * Additional BufferMemory and ConversationChain if enabled
     *
     * @param model
     * @param config
     * @protected
     */
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

    /**
     * Main abstract method to define call to LLM
     *
     * @param prompt
     */
    abstract call(prompt: string): Promise<string>;

    /**
     * Main method to call conversation chain
     * and log response
     *
     * @param prompt
     */
    async conversationCall(prompt: string): Promise<string> {
        if (!this.config.enable?.conversationChain || !this.conversationChain) {
            throw new Error('Conversation chain is not enabled');
        }
        const response = await this.conversationChain.invoke({ input: prompt });
        this.logResponse(prompt, response.response);
        return response.response;
    }

    /**
     * Method to log LLM call response
     *
     * @param _prompt
     * @param response
     * @protected
     */
    protected logResponse(_prompt: string, response: string): void {
        console.log(`
            ___ RESPONSE
            ${response}
        `);
    }

    /**
     * Method to clear memory
     *
     * @protected
     */
    protected clearMemory(): void {
        this.memory?.clear();
    }
}
