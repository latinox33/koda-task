export interface IMessage {
    author: 'user' | 'ai';
    message: string;
    date: string;
    hour: string;
    datePlaceholder: string;
}

export interface IBubbleMessageProperties extends IMessage {
    position: 'left' | 'right';
    avatar: {
        class: string;
        text: string;
    };
}
