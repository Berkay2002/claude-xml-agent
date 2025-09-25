import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { docChunk, docEmbedding, documentation } from "../db/schema";
import { type ChunkOptions, chunkText } from "./chunking";
import { generateEmbeddings } from "./embeddings";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export type DocumentInput = {
  title: string;
  content: string;
  source: string;
  url?: string;
  metadata?: Record<string, any>;
  userId: string;
};

export type IngestionResult = {
  documentId: string;
  chunksCreated: number;
  embeddingsCreated: number;
};

export const ingestDocument = async (
  input: DocumentInput,
  chunkOptions?: ChunkOptions
): Promise<IngestionResult> => {
  const { title, content, source, url, metadata = {}, userId } = input;

  // Create the documentation record
  const [doc] = await db
    .insert(documentation)
    .values({
      title,
      content,
      source,
      url,
      metadata,
      userId,
    })
    .returning({ id: documentation.id });

  // Chunk the document
  const chunks = chunkText(content, chunkOptions);

  if (chunks.length === 0) {
    throw new Error("Document produced no valid chunks");
  }

  // Create chunk records
  const chunkRecords = await db
    .insert(docChunk)
    .values(
      chunks.map((chunk) => ({
        documentationId: doc.id,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        chunkIndex: chunk.index,
        metadata: {
          startChar: chunk.startChar,
          endChar: chunk.endChar,
        },
      }))
    )
    .returning({ id: docChunk.id, content: docChunk.content });

  // Generate embeddings for all chunks
  const chunkTexts = chunkRecords.map((record) => record.content);
  const embeddings = await generateEmbeddings(chunkTexts);

  // Create embedding records
  const embeddingRecords = await db
    .insert(docEmbedding)
    .values(
      embeddings.map((embedding, index) => ({
        chunkId: chunkRecords[index].id,
        embedding: embedding.embedding,
        model: "gemini-embedding-001",
      }))
    )
    .returning({ id: docEmbedding.id });

  return {
    documentId: doc.id,
    chunksCreated: chunkRecords.length,
    embeddingsCreated: embeddingRecords.length,
  };
};

export const deleteDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  // Verify ownership and delete (cascades to chunks and embeddings)
  await db
    .delete(documentation)
    .where(
      and(eq(documentation.id, documentId), eq(documentation.userId, userId))
    );
};

export const listUserDocuments = async (userId: string) => {
  return await db
    .select({
      id: documentation.id,
      title: documentation.title,
      source: documentation.source,
      url: documentation.url,
      createdAt: documentation.createdAt,
      updatedAt: documentation.updatedAt,
    })
    .from(documentation)
    .where(eq(documentation.userId, userId))
    .orderBy(desc(documentation.updatedAt));
};
