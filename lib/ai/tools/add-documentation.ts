import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { ingestDocument } from "@/lib/rag/document-ingestor";

type AddDocumentationProps = {
  session: Session;
};

export const addDocumentationTool = ({ session }: AddDocumentationProps) =>
  tool({
    description: `Add new documentation to your knowledge base for future reference.
    Use this when the user provides documentation content they want to store,
    such as API references, framework guides, code examples, or development notes.`,
    inputSchema: z.object({
      title: z.string().describe("A descriptive title for the documentation"),
      content: z.string().describe("The full content of the documentation"),
      source: z
        .string()
        .describe(
          "The source or type of documentation (e.g., 'Next.js Docs', 'React Guide', 'Personal Notes')"
        ),
      url: z
        .string()
        .optional()
        .describe("Optional URL where this documentation came from"),
    }),
    execute: async ({ title, content, source, url }) => {
      try {
        const result = await ingestDocument({
          title,
          content,
          source,
          url,
          userId: session.user.id,
        });

        return {
          success: true,
          message: `Successfully added "${title}" to your documentation knowledge base.`,
          documentId: result.documentId,
          chunksCreated: result.chunksCreated,
          embeddingsCreated: result.embeddingsCreated,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to add documentation: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  });
