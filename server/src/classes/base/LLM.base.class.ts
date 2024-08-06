import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { LLMModelConfig, LLMType } from '../../interfaces/LLM.interface.ts';
import { EPromptName, promptTemplateMap } from '../../utils/prompt.util.ts';
import {
    PromptTemplate,
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
} from '@langchain/core/prompts';

/**
 * Base class for LLM services
 * Can extend by any LLM type
 *
 * @doc https://js.langchain.com/v0.1/docs/modules/memory/types/buffer/
 * This class contains definitions of basic methods to support LLM
 */
export interface ILLMServiceBaseClass {
    call(prompt: string, parserCallback?: (t: string) => string): Promise<string>;
    conversationCall(
        prompt: string,
        parserCallback: (t: string) => string,
        promptTemplate?: PromptTemplate | ChatPromptTemplate,
        callValues?: { [k: string]: string },
    ): Promise<string>;
    clearMemory(): void;
    getEmbeddingsModel<K = unknown>(): K;
    prepareChatPromptTemplate(
        templateName: EPromptName,
        variablesToReplace?: { [k: string]: string },
    ): Promise<ChatPromptTemplate>;
}
export abstract class LLMBaseClass<T extends LLMType, K> implements ILLMServiceBaseClass {
    protected model: T;
    protected embeddings: K;
    protected config: LLMModelConfig;
    protected memory: BufferMemory | undefined;
    protected conversationChain: ConversationChain | undefined;

    public readonly isEnableLogging: boolean;

    /**
     * In constructor is defined model and config
     * Additional BufferMemory and ConversationChain if enabled
     *
     * @param model
     * @param embeddings
     * @param config
     * @protected
     */
    protected constructor(model: T, embeddings: K, config: LLMModelConfig) {
        this.model = model;
        this.embeddings = embeddings;
        this.config = config;
        this.isEnableLogging = config.enable?.logResponse || false;

        if (config.enable?.conversationChain) {
            this.memory = new BufferMemory({
                returnMessages: true,
                memoryKey: 'history',
            });
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
     * @param parserCallback
     */
    abstract call(prompt: string, parserCallback?: (t: string) => string): Promise<string>;

    /**
     * Main method to call conversation chain
     * and log response
     *
     * @param prompt
     * @param parserCallback
     * @param promptTemplate
     * @param callValues
     */
    async conversationCall(
        prompt: string,
        parserCallback: (t: string) => string,
        promptTemplate?: PromptTemplate | ChatPromptTemplate,
        callValues?: { [k: string]: string },
    ): Promise<string> {
        if (!this.config.enable?.conversationChain) {
            throw new Error('Conversation chain is not enabled');
        }
        if (!this.conversationChain) {
            if (!promptTemplate) throw new Error('Conversation chain is not enabled without template');
            this.initConversationChainWithTemplate(promptTemplate);
        }

        const response = await this.conversationChain!.call({
            ...(callValues ? { ...callValues } : {}),
            input: prompt,
        });
        if (this.isEnableLogging) this.logResponse(response.response);
        return parserCallback(response.response);
    }

    async prepareChatPromptTemplate(
        templateName: EPromptName,
        variables?: { [k: string]: string },
    ): Promise<ChatPromptTemplate> {
        const template = promptTemplateMap.get(templateName);
        if (!template) {
            throw new Error(`Not found template for name ${templateName}`);
        }

        const replacePlaceholders = (text: string): string => {
            return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
                if (variables && key in variables) {
                    return variables![key];
                }
                return match;
            });
        };
        if (variables) template.system = replacePlaceholders(template.system);

        const systemMessagePromptTemplate = SystemMessagePromptTemplate.fromTemplate(template.system);
        if (variables) await systemMessagePromptTemplate.format(variables);

        return ChatPromptTemplate.fromMessages([
            systemMessagePromptTemplate,
            HumanMessagePromptTemplate.fromTemplate(template.human),
        ]);
    }

    /**
     * Method to clear memory
     */
    clearMemory(): void {
        this.memory?.clear();
    }

    getEmbeddingsModel<E = K>(): E {
        return this.embeddings as unknown as E;
    }

    /**
     * Method to log LLM call response
     *
     * @param response
     * @param prompt
     * @protected
     */
    protected logResponse(response: string, prompt?: string): void {
        console.log(`
            ___ RESPONSE
            ${response}
        `);
        if (prompt) {
            console.log(`
            ___ PROMPT
            ${prompt}
        `);
        }
    }

    /**
     * @todo
     *
     * @param promptTemplate
     * @protected
     */
    protected initConversationChainWithTemplate(promptTemplate: PromptTemplate | ChatPromptTemplate) {
        this.conversationChain = new ConversationChain({
            llm: this.model,
            memory: this.memory,
            prompt: promptTemplate,
        });
    }
}
