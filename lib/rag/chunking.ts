export interface ChunkOptions {
  maxTokens?: number;
  overlap?: number;
  minChunkSize?: number;
}

export interface DocumentChunk {
  content: string;
  index: number;
  tokenCount: number;
  startChar: number;
  endChar: number;
}

// Simple token estimation (roughly 4 characters = 1 token for English)
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Split text into paragraphs, then sentences if needed
export const chunkText = (
  text: string,
  options: ChunkOptions = {}
): DocumentChunk[] => {
  const { maxTokens = 500, overlap = 50, minChunkSize = 100 } = options;

  const chunks: DocumentChunk[] = [];

  // First, split by paragraphs (double newlines)
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  let currentChunk = "";
  let chunkStartChar = 0;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const paragraphTokens = estimateTokens(paragraph);
    const currentTokens = estimateTokens(currentChunk);

    // If adding this paragraph would exceed maxTokens, finalize current chunk
    if (currentChunk && currentTokens + paragraphTokens > maxTokens) {
      const chunk = createChunk(currentChunk, chunkIndex, chunkStartChar, text);
      if (chunk.tokenCount >= minChunkSize) {
        chunks.push(chunk);
        chunkIndex++;
      }

      // Start new chunk with overlap from previous chunk if it exists
      if (overlap > 0 && chunks.length > 0) {
        const overlapText = getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + "\n\n" + paragraph;
        chunkStartChar = text.indexOf(overlapText, chunkStartChar);
      } else {
        currentChunk = paragraph;
        chunkStartChar = text.indexOf(paragraph, chunkStartChar);
      }
    } else {
      // Add paragraph to current chunk
      if (currentChunk) {
        currentChunk += "\n\n" + paragraph;
      } else {
        currentChunk = paragraph;
        chunkStartChar = text.indexOf(paragraph, chunkStartChar);
      }
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    const chunk = createChunk(currentChunk, chunkIndex, chunkStartChar, text);
    if (chunk.tokenCount >= minChunkSize) {
      chunks.push(chunk);
    }
  }

  return chunks;
};

const createChunk = (
  content: string,
  index: number,
  startChar: number,
  originalText: string
): DocumentChunk => {
  const trimmedContent = content.trim();
  const endChar = startChar + trimmedContent.length;

  return {
    content: trimmedContent,
    index,
    tokenCount: estimateTokens(trimmedContent),
    startChar,
    endChar: Math.min(endChar, originalText.length),
  };
};

const getOverlapText = (text: string, overlapTokens: number): string => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return "";

  let overlapText = "";
  let tokenCount = 0;

  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i].trim() + ".";
    const sentenceTokens = estimateTokens(sentence);

    if (tokenCount + sentenceTokens <= overlapTokens) {
      overlapText = sentence + " " + overlapText;
      tokenCount += sentenceTokens;
    } else {
      break;
    }
  }

  return overlapText.trim();
};
