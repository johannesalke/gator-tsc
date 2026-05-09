ALTER TABLE "feeds" ADD COLUMN "url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_url_unique" UNIQUE("url");