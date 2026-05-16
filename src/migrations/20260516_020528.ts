import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_playbook_entries_tier" AS ENUM('ideal', 'acceptable', 'fallback_1', 'fallback_2', 'walk_away');
  CREATE TYPE "public"."enum_playbook_entries_approval_level_required" AS ENUM('self', 'senior_counsel', 'gc', 'cfo', 'ceo');
  CREATE TYPE "public"."enum_counterparty_drafts_industry" AS ENUM('saas', 'finserv', 'health', 'retail', 'public', 'other');
  CREATE TYPE "public"."enum_counterparty_drafts_counterparty_type" AS ENUM('customer', 'vendor', 'partner');
  CREATE TYPE "public"."enum_counterparty_drafts_counterparty_size" AS ENUM('smb', 'mid', 'ent');
  CREATE TYPE "public"."enum_counterparty_drafts_deal_value_band" AS ENUM('lt_50k', '50k_250k', '250k_1m', 'gt_1m');
  CREATE TYPE "public"."enum_counterparty_drafts_term_length" AS ENUM('lt_1y', '1y', '2_3y', 'gt_3y');
  CREATE TYPE "public"."enum_counterparty_drafts_urgency" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum_negotiation_log_entries_approval_level_used" AS ENUM('self', 'senior_counsel', 'gc', 'cfo', 'ceo');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "clause_families" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sub_clauses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "playbook_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"clause_family_id" integer NOT NULL,
  	"sub_clause_id" integer NOT NULL,
  	"tier" "enum_playbook_entries_tier" NOT NULL,
  	"approval_level_required" "enum_playbook_entries_approval_level_required" NOT NULL,
  	"version" numeric DEFAULT 1 NOT NULL,
  	"position_description" varchar NOT NULL,
  	"rationale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "counterparty_drafts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry" "enum_counterparty_drafts_industry" NOT NULL,
  	"counterparty_type" "enum_counterparty_drafts_counterparty_type" NOT NULL,
  	"counterparty_size" "enum_counterparty_drafts_counterparty_size" NOT NULL,
  	"deal_value_band" "enum_counterparty_drafts_deal_value_band" NOT NULL,
  	"term_length" "enum_counterparty_drafts_term_length" NOT NULL,
  	"urgency" "enum_counterparty_drafts_urgency" NOT NULL,
  	"clause_family_id" integer NOT NULL,
  	"sub_clause_id" integer NOT NULL,
  	"clause_text" varchar NOT NULL,
  	"source" varchar DEFAULT 'synthetic',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "negotiation_log_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"counterparty_draft_id" integer NOT NULL,
  	"playbook_entry_id" integer,
  	"final_position" varchar NOT NULL,
  	"approval_level_used" "enum_negotiation_log_entries_approval_level_used" NOT NULL,
  	"date_closed" timestamp(3) with time zone NOT NULL,
  	"what_was_traded" varchar,
  	"leverage" varchar NOT NULL,
  	"risk_assessment" varchar NOT NULL,
  	"trade_or_context" varchar NOT NULL,
  	"precedent_management" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"clause_families_id" integer,
  	"sub_clauses_id" integer,
  	"playbook_entries_id" integer,
  	"counterparty_drafts_id" integer,
  	"negotiation_log_entries_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "playbook_entries" ADD CONSTRAINT "playbook_entries_clause_family_id_clause_families_id_fk" FOREIGN KEY ("clause_family_id") REFERENCES "public"."clause_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "playbook_entries" ADD CONSTRAINT "playbook_entries_sub_clause_id_sub_clauses_id_fk" FOREIGN KEY ("sub_clause_id") REFERENCES "public"."sub_clauses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "counterparty_drafts" ADD CONSTRAINT "counterparty_drafts_clause_family_id_clause_families_id_fk" FOREIGN KEY ("clause_family_id") REFERENCES "public"."clause_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "counterparty_drafts" ADD CONSTRAINT "counterparty_drafts_sub_clause_id_sub_clauses_id_fk" FOREIGN KEY ("sub_clause_id") REFERENCES "public"."sub_clauses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "negotiation_log_entries" ADD CONSTRAINT "negotiation_log_entries_counterparty_draft_id_counterparty_drafts_id_fk" FOREIGN KEY ("counterparty_draft_id") REFERENCES "public"."counterparty_drafts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "negotiation_log_entries" ADD CONSTRAINT "negotiation_log_entries_playbook_entry_id_playbook_entries_id_fk" FOREIGN KEY ("playbook_entry_id") REFERENCES "public"."playbook_entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clause_families_fk" FOREIGN KEY ("clause_families_id") REFERENCES "public"."clause_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sub_clauses_fk" FOREIGN KEY ("sub_clauses_id") REFERENCES "public"."sub_clauses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_playbook_entries_fk" FOREIGN KEY ("playbook_entries_id") REFERENCES "public"."playbook_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_counterparty_drafts_fk" FOREIGN KEY ("counterparty_drafts_id") REFERENCES "public"."counterparty_drafts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_negotiation_log_entries_fk" FOREIGN KEY ("negotiation_log_entries_id") REFERENCES "public"."negotiation_log_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "clause_families_name_idx" ON "clause_families" USING btree ("name");
  CREATE INDEX "clause_families_updated_at_idx" ON "clause_families" USING btree ("updated_at");
  CREATE INDEX "clause_families_created_at_idx" ON "clause_families" USING btree ("created_at");
  CREATE UNIQUE INDEX "sub_clauses_name_idx" ON "sub_clauses" USING btree ("name");
  CREATE INDEX "sub_clauses_updated_at_idx" ON "sub_clauses" USING btree ("updated_at");
  CREATE INDEX "sub_clauses_created_at_idx" ON "sub_clauses" USING btree ("created_at");
  CREATE INDEX "playbook_entries_clause_family_idx" ON "playbook_entries" USING btree ("clause_family_id");
  CREATE INDEX "playbook_entries_sub_clause_idx" ON "playbook_entries" USING btree ("sub_clause_id");
  CREATE INDEX "playbook_entries_updated_at_idx" ON "playbook_entries" USING btree ("updated_at");
  CREATE INDEX "playbook_entries_created_at_idx" ON "playbook_entries" USING btree ("created_at");
  CREATE INDEX "counterparty_drafts_clause_family_idx" ON "counterparty_drafts" USING btree ("clause_family_id");
  CREATE INDEX "counterparty_drafts_sub_clause_idx" ON "counterparty_drafts" USING btree ("sub_clause_id");
  CREATE INDEX "counterparty_drafts_updated_at_idx" ON "counterparty_drafts" USING btree ("updated_at");
  CREATE INDEX "counterparty_drafts_created_at_idx" ON "counterparty_drafts" USING btree ("created_at");
  CREATE INDEX "negotiation_log_entries_counterparty_draft_idx" ON "negotiation_log_entries" USING btree ("counterparty_draft_id");
  CREATE INDEX "negotiation_log_entries_playbook_entry_idx" ON "negotiation_log_entries" USING btree ("playbook_entry_id");
  CREATE INDEX "negotiation_log_entries_updated_at_idx" ON "negotiation_log_entries" USING btree ("updated_at");
  CREATE INDEX "negotiation_log_entries_created_at_idx" ON "negotiation_log_entries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_clause_families_id_idx" ON "payload_locked_documents_rels" USING btree ("clause_families_id");
  CREATE INDEX "payload_locked_documents_rels_sub_clauses_id_idx" ON "payload_locked_documents_rels" USING btree ("sub_clauses_id");
  CREATE INDEX "payload_locked_documents_rels_playbook_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("playbook_entries_id");
  CREATE INDEX "payload_locked_documents_rels_counterparty_drafts_id_idx" ON "payload_locked_documents_rels" USING btree ("counterparty_drafts_id");
  CREATE INDEX "payload_locked_documents_rels_negotiation_log_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("negotiation_log_entries_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "clause_families" CASCADE;
  DROP TABLE "sub_clauses" CASCADE;
  DROP TABLE "playbook_entries" CASCADE;
  DROP TABLE "counterparty_drafts" CASCADE;
  DROP TABLE "negotiation_log_entries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_playbook_entries_tier";
  DROP TYPE "public"."enum_playbook_entries_approval_level_required";
  DROP TYPE "public"."enum_counterparty_drafts_industry";
  DROP TYPE "public"."enum_counterparty_drafts_counterparty_type";
  DROP TYPE "public"."enum_counterparty_drafts_counterparty_size";
  DROP TYPE "public"."enum_counterparty_drafts_deal_value_band";
  DROP TYPE "public"."enum_counterparty_drafts_term_length";
  DROP TYPE "public"."enum_counterparty_drafts_urgency";
  DROP TYPE "public"."enum_negotiation_log_entries_approval_level_used";`)
}
