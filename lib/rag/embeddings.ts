import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const embeddingModel = google.textEmbeddingModel("gemini-embedding-001"); // 3072 dimensions, reduced to 768 for pgvector compatibility

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const input = text.replaceAll("\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
    providerOptions: {
      google: {
        outputDimensionality: 768, // Reduce from 3072 to 768 dimensions for pgvector compatibility
      },
    },
  });
  return embedding;
};

export const generateEmbeddings = async (
  texts: string[]
): Promise<Array<{ text: string; embedding: number[] }>> => {
  const inputs = texts.map((text) => text.replaceAll("\n", " "));
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: inputs,
    providerOptions: {
      google: {
        outputDimensionality: 768, // Reduce from 3072 to 768 dimensions for pgvector compatibility
      },
    },
  });
  return embeddings.map((embedding, i) => ({
    text: texts[i],
    embedding,
  }));
};
