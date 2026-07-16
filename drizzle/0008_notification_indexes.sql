-- The unique index below cannot be created while duplicate reminders already
-- exist, and the racy check-then-act it replaces may well have produced some.
-- Keep the earliest row of each (user_id, dedupKey) and drop the rest: they are
-- redundant copies of the same reminder, and the oldest is the one the user is
-- most likely to have already seen.
DELETE FROM "notifications"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "user_id", "data" ->> 'dedupKey'
        ORDER BY "created_at", "id"
      ) AS rn
    FROM "notifications"
    WHERE "data" ->> 'dedupKey' IS NOT NULL
  ) ranked
  WHERE rn > 1
);--> statement-breakpoint
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_user_id_dedup_key_idx" ON "notifications" USING btree ("user_id",("data" ->> 'dedupKey')) WHERE "notifications"."data" ->> 'dedupKey' IS NOT NULL;