import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_negotiation_log_entries_match_type" AS ENUM('ideal', 'acceptable', 'fallback_1', 'fallback_2', 'out_of_playbook');
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "leverage" DROP NOT NULL;
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "risk_assessment" DROP NOT NULL;
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "trade_or_context" DROP NOT NULL;
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "precedent_management" DROP NOT NULL;
  ALTER TABLE "negotiation_log_entries" ADD COLUMN "match_type" "enum_negotiation_log_entries_match_type" NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "negotiation_log_entries" ALTER COLUMN "leverage" SET NOT NULL;
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "risk_assessment" SET NOT NULL;
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "trade_or_context" SET NOT NULL;
  ALTER TABLE "negotiation_log_entries" ALTER COLUMN "precedent_management" SET NOT NULL;
  ALTER TABLE "negotiation_log_entries" DROP COLUMN "match_type";
  DROP TYPE "public"."enum_negotiation_log_entries_match_type";`)
}
