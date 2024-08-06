import { Index, Pinecone, QueryResponse } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import dotenv from 'dotenv';
import path from 'path';
import * as cheerio from 'cheerio';
import { IPineconeIndexConfiguration, IPineconeQueryOptions } from '../interfaces/pinecone.inteface.ts';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface IRAGServiceEmbeddings {
    embedQuery(text: string): Promise<number[]>;
}

export interface RAGServiceConfig {
    pinecone: IPineconeIndexConfiguration;
    textSplitter: ITextSplitterConfiguration;
}

export interface ITextSplitterConfiguration {
    chunkSize: number; // 300,
    chunkOverlap: number; // 20,
}

/**
 * RAG Service class
 * with pinecone vector store implementation
 *
 * This class can scrap to chunks site page
 * and return query chunks to LLM invoke
 *
 * @doc https://js.langchain.com/v0.2/docs/tutorials/rag/
 * @doc https://docs.pinecone.io/guides/get-started/quickstart
 */
export interface IRAGService {
    query(question: string, config?: IPineconeQueryOptions): Promise<QueryResponse>;
    queryChunks(question: string, config?: IPineconeQueryOptions): Promise<string[]>;
    createChunksByUrl(url: string, fillVectorStore: boolean): Promise<string[]>;
}
export class RAGService<T extends IRAGServiceEmbeddings> implements IRAGService {
    private embeddings: T;
    private config: RAGServiceConfig;
    private textSplitter: RecursiveCharacterTextSplitter;

    private pc: Pinecone;
    private pcIndex: Index;

    /**
     * In constructor initiate pinecone vector store
     * and text splitter instances
     *
     * @param embeddings
     * @param config
     */
    constructor(embeddings: T, config: RAGServiceConfig) {
        const apiKey = process.env.PINECONE_API_KEY;
        if (!apiKey) throw new Error('Not found API KEY');

        this.pc = new Pinecone({ apiKey });
        this.textSplitter = new RecursiveCharacterTextSplitter({ ...config.textSplitter });
        this.embeddings = embeddings;
        this.config = config;

        this.pcIndex = this.pc.Index(config.pinecone.name);
    }

    /**
     * Method to run queries the Pinecone index based on the given question
     *
     * @param question
     * @param config
     */
    async query(question: string, config?: IPineconeQueryOptions): Promise<QueryResponse> {
        if (!this.pcIndex) await this.createPineconeIndex();

        const promptEmbedding = await this.embeddings.embedQuery(question); // Change question to number vector (embedding)
        return await this.pcIndex.query({
            vector: promptEmbedding, // vector embedding sentence of question
            ...(config ? { ...config } : { ...this.getDefaultQueryOptions() }),
        });
    }

    /**
     * Method to get chunks from Pinecone queries
     *
     * @param question
     * @param config
     */
    async queryChunks(question: string, config?: IPineconeQueryOptions): Promise<string[]> {
        const queryResponse = await this.query(question, config);
        return queryResponse.matches?.map((match) => match.metadata?.text as string) || [];
    }

    /**
     * Method to generate chunks from content by url
     * If needed you can fill Pinecone vector store new chunks by arg [fillVectorStore]
     *
     * @param url
     * @param fillVectorStore
     */
    async createChunksByUrl(url: string, fillVectorStore: boolean = false): Promise<string[]> {
        const pageContent = await this.scrapeWebsite(url);
        const pageContentChunks = await this.chunkText(pageContent);

        if (fillVectorStore) await this.fillVectorStore(pageContentChunks);

        return pageContentChunks;
    }

    /**
     * Method fill vector store embeddings by chunks
     *
     * @doc https://js.langchain.com/v0.2/docs/integrations/text_embedding/hugging_face_inference/#usage
     * @doc https://huggingface.co/blog/getting-started-with-embeddings
     * @doc https://github.com/huggingface/text-embeddings-inference
     * @doc https://docs.pinecone.io/guides/data/upsert-data
     * @doc
     * @param chunks
     * @private
     */
    private async fillVectorStore(chunks: string[]): Promise<void> {
        if (!this.pcIndex) await this.createPineconeIndex();

        for (let i = 0; i < chunks.length; i++) {
            const embedding = await this.embeddings.embedQuery(chunks[i]);
            await this.pcIndex.upsert([
                {
                    id: `chunk_${i}`,
                    values: embedding,
                    metadata: { text: chunks[i] },
                },
            ]);
        }
    }

    /**
     * Split text to chunks
     *
     * @doc https://js.langchain.com/v0.2/docs/how_to/contextual_compression/#embeddingsfilter
     * @param text
     * @private
     */
    private async chunkText(text: string): Promise<string[]> {
        return this.textSplitter.splitText(text);
    }

    /**
     * Method to fetch site page and parsing HTML to text
     *
     * @doc https://github.com/cheeriojs/cheerio
     * @param url
     * @private
     */
    private async scrapeWebsite(url: string): Promise<string> {
        const response = await fetch(url);
        const responseText = await response.text();
        const $ = cheerio.load(responseText);
        return $('body').text();
    }

    /**
     * Method to create Pinecone index
     *
     * @protected
     */
    protected async createPineconeIndex(): Promise<void> {
        await this.pc.createIndex({ ...this.config.pinecone });
    }

    protected setPineconeIndex(): void {
        this.pcIndex = this.pc.Index(this.config.pinecone.name);
    }

    /**
     * Method to get default pinecone index query options
     *
     * @protected
     */
    protected getDefaultQueryOptions(): IPineconeQueryOptions {
        return {
            topK: 3, // how much similar vectors needed
            includeMetadata: true,
        };
    }
}
