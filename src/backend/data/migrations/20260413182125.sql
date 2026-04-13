-- Create "invites" table
CREATE TABLE "public"."invites" ("code" text NOT NULL, "username" text NOT NULL, PRIMARY KEY ("code"));
-- Create "users" table
CREATE TABLE "public"."users" ("username" text NOT NULL, "password" text NOT NULL, "admin" boolean NOT NULL DEFAULT false, PRIMARY KEY ("username"));
-- Create "ticketlog" table
CREATE TABLE "public"."ticketlog" ("date" timestamptz NOT NULL, "username" text NOT NULL, "tandem_count" integer NOT NULL, "instructor_count" integer NOT NULL, "blue_ticket_count" integer NOT NULL, "pink_ticket_count" integer NOT NULL, "kit_hire_count" integer NOT NULL, PRIMARY KEY ("date", "username"), CONSTRAINT "ticketlog_username_fkey" FOREIGN KEY ("username") REFERENCES "public"."users" ("username") ON UPDATE NO ACTION ON DELETE CASCADE);
