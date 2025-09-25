CREATE TABLE IF NOT EXISTS "DocChunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentationId" uuid NOT NULL,
	"content" text NOT NULL,
	"tokenCount" integer NOT NULL,
	"chunkIndex" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocEmbedding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chunkId" uuid NOT NULL,
	"embedding" vector(768) NOT NULL,
	"model" text DEFAULT 'gemini-embedding-001' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Documentation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"source" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocChunk" ADD CONSTRAINT "DocChunk_documentationId_Documentation_id_fk" FOREIGN KEY ("documentationId") REFERENCES "public"."Documentation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocEmbedding" ADD CONSTRAINT "DocEmbedding_chunkId_DocChunk_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."DocChunk"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "DocEmbedding" USING hnsw ("embedding" vector_cosine_ops);