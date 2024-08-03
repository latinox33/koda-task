export interface IMessage {
    author: 'user' | 'ai';
    message: string;
    date: string;
    hour: string;
    datePlaceholder: string;
}
