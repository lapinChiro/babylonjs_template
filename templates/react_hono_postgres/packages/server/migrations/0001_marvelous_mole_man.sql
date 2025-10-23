CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_key" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" bigint NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "images_file_key_unique" UNIQUE("file_key")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_images_file_key" ON "images" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "idx_images_user_id" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_images_created_at" ON "images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_items_name" ON "items" USING btree ("name");--> statement-breakpoint
INSERT INTO "items" ("name") VALUES
  ('MacBook Pro'),
  ('iPhone 15'),
  ('iPad Air'),
  ('AirPods Pro'),
  ('Magic Mouse'),
  ('Studio Display');