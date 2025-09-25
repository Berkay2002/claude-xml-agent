import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { searchDocumentation } from "@/lib/rag/vector-search";

type SearchDocumentationProps = {
  session: Session;
};

export const searchDocumentationTool = ({
  session,
}: SearchDocumentationProps) =>
  tool({
    description: `Search through your stored development documentation to find relevant information.
    Use this when the user asks questions about frameworks, APIs, best practices, or any development topics
    that might be covered in documentation you've stored. Always search before answering development questions.`,
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query - describe what information you need to find"
        ),
      maxResults: z
        .number()
        .min(1)
        .max(20)
        .default(5)
        .describe("Maximum number of results to return"),
    }),
    execute: async ({ query, maxResults }) => {
      const results = await searchDocumentation(query, {
        userId: session.user.id,
        maxResults,
        minSimilarity: 0.3, // Higher threshold for better quality results
      });

      if (results.length === 0) {
        return {
          found: false,
          message: "No relevant documentation found for this query.",
          query,
        };
      }

      // Group results by document for better presentation
      const groupedResults = results.reduce(
        (acc, result) => {
          if (!acc[result.documentId]) {
            acc[result.documentId] = {
              title: result.title,
              source: result.source,
              url: result.url,
              chunks: [],
            };
          }
          acc[result.documentId].chunks.push({
            content: result.content,
            similarity: result.similarity,
            chunkIndex: result.chunkIndex,
          });
          return acc;
        },
        {} as Record<string, any>
      );

      const formattedResults = Object.values(groupedResults).map(
        (doc: any) => ({
          title: doc.title,
          source: doc.source,
          url: doc.url,
          chunks: doc.chunks
            .sort((a: any, b: any) => b.similarity - a.similarity)
            .slice(0, 3), // Limit chunks per document
        })
      );

      return {
        found: true,
        query,
        results: formattedResults,
        totalDocuments: formattedResults.length,
        totalChunks: results.length,
        message: `Found ${results.length} relevant sections across ${formattedResults.length} documents.`,
      };
    },
  });
