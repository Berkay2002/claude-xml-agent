ALTER TABLE "User" ADD COLUMN "isApproved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "approvedAt" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "approvedBy" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "role" varchar(20) DEFAULT 'user' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_approvedBy_User_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
