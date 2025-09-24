export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Gemini Flash",
    description: "Fast multimodal model optimized for speed and XML conversion",
  },
  {
    id: "chat-model-reasoning",
    name: "Gemini Pro",
    description:
      "Advanced reasoning model for complex problems and XML structuring",
  },
];
