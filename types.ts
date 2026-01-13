
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export enum ModelType {
  FAST = 'fast',
  SEARCH = 'search',
  MAPS = 'maps',
  IMAGE = 'image',
  THINKING = 'thinking'
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  image?: string;
  modelUsed?: ModelType;
  timestamp: number;
  grounding?: GroundingChunk[];
  isThinking?: boolean;
}

export interface ProductApp {
  name: string;
  description: string;
  connectsTo: string;
  link?: string;
}
