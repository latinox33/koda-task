interface IPineconeSpecServerlessConfiguration {
    cloud: EPineconeServerlessCloud;
    region: string;
}

interface IPineconeSpecConfiguration {
    serverless: IPineconeSpecServerlessConfiguration;
}

export interface IPineconeIndexConfiguration {
    name: string;
    dimension: number;
    metric: EPineconeIndexMetric;
    spec: IPineconeSpecConfiguration;
}

export interface IPineconeQueryOptions {
    topK: number;
    includeMetadata: boolean;
}

export enum EPineconeServerlessCloud {
    AWS = 'aws',
    GCP = 'gcp',
    Azure = 'azure',
}

export enum EPineconeServerlessRegion {
    US_EAST_1 = 'us-east-1', // Only AWS
    US_WEST_2 = 'us-west-2', // Only AWS
    EU_WEST_2 = 'eu-west-1', // Only AWS
    US_CENTRAL1 = 'us-central1', // Only Google
    EASTUS2 = 'eastus2', // Only Azure
}

export enum EPineconeIndexMetric {
    COSINE = 'cosine',
    EUCLIDEAN = 'euclidean',
    dotproduct = 'dotproduct',
}
