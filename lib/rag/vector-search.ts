import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { docChunk, docEmbedding, documentation } from "../db/schema";
import { generateEmbedding } from "./embeddings";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export type SearchResult = {
  chunkId: string;
  documentId: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  similarity: number;
  chunkIndex: number;
};

export type SearchOptions = {
  userId: string;
  maxResults?: number;
  minSimilarity?: number;
};

export const searchDocumentation = async (
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> => {
  const { userId, maxResults = 10, minSimilarity = 0.1 } = options;

  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);

  // Perform vector similarity search
  const similarity = sql<number>`1 - (${docEmbedding.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`;

  const results = await db
    .select({
      chunkId: docChunk.id,
      documentId: documentation.id,
      title: documentation.title,
      content: docChunk.content,
      source: documentation.source,
      url: documentation.url,
      similarity,
      chunkIndex: docChunk.chunkIndex,
    })
    .from(docEmbedding)
    .innerJoin(docChunk, eq(docEmbedding.chunkId, docChunk.id))
    .innerJoin(documentation, eq(docChunk.documentationId, documentation.id))
    .where(
      and(
        eq(documentation.userId, userId),
        sql`${similarity} > ${minSimilarity}`
      )
    )
    .orderBy(desc(similarity))
    .limit(maxResults);

  return results.map((result) => ({
    chunkId: result.chunkId,
    documentId: result.documentId,
    title: result.title,
    content: result.content,
    source: result.source,
    url: result.url || undefined,
    similarity: result.similarity,
    chunkIndex: result.chunkIndex,
  }));
};

export const searchDocumentationByIds = async (
  chunkIds: string[],
  userId: string
): Promise<SearchResult[]> => {
  const results = await db
    .select({
      chunkId: docChunk.id,
      documentId: documentation.id,
      title: documentation.title,
      content: docChunk.content,
      source: documentation.source,
      url: documentation.url,
      chunkIndex: docChunk.chunkIndex,
    })
    .from(docChunk)
    .innerJoin(documentation, eq(docChunk.documentationId, documentation.id))
    .where(
      and(
        sql`${docChunk.id} = ANY(${chunkIds})`,
        eq(documentation.userId, userId)
      )
    )
    .orderBy(docChunk.chunkIndex);

  return results.map((result) => ({
    chunkId: result.chunkId,
    documentId: result.documentId,
    title: result.title,
    content: result.content,
    source: result.source,
    url: result.url || undefined,
    similarity: 1, // Not applicable for direct ID lookup
    chunkIndex: result.chunkIndex,
  }));
};
