interface ModelConfig {
    modelName: string;
    maxTokens: number;
    temperature: number;
}

export interface ILLMServiceBaseClass {
    generateResponse(prompt: string): Promise<string>;
}

export abstract class LLMServiceBaseClass<T> implements ILLMServiceBaseClass {
    protected model: T;
    protected config: ModelConfig;

    protected constructor(model: T, config: ModelConfig) {
        this.model = model;
        this.config = config;
    }

    abstract generateResponse(prompt: string): Promise<string>;

    protected logResponse(prompt: string, response: string): void {
        console.log(`
            __ PROMPT
            ${prompt}
    
            ___ RESPONSE
            ${response}
        `);
    }
}
