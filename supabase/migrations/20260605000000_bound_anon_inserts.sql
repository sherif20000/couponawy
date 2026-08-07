-- Adds length CHECK constraints to the two anonymous-insertable tables as a
-- defense-in-depth measure that mirrors the server-action validation in
-- src/app/report-coupon/actions.ts and src/app/contact/actions.ts.
--
-- All constraints are added with NOT VALID so the migration succeeds even if
-- there are pre-existing rows that exceed the limits (legacy data is not
-- scanned; new inserts and updates are still enforced immediately).
--
-- If you later want to validate legacy rows too, run:
--   ALTER TABLE public.coupon_reports VALIDATE CONSTRAINT <name>;

-- ── coupon_reports ────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE public.coupon_reports
    ADD CONSTRAINT coupon_reports_note_len
    CHECK (note IS NULL OR char_length(note) <= 2000) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.coupon_reports
    ADD CONSTRAINT coupon_reports_coupon_url_len
    CHECK (coupon_url IS NULL OR char_length(coupon_url) <= 500) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── contact_messages ──────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE public.contact_messages
    ADD CONSTRAINT contact_messages_name_len
    CHECK (name IS NULL OR char_length(name) <= 120) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.contact_messages
    ADD CONSTRAINT contact_messages_subject_len
    CHECK (char_length(subject) <= 200) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.contact_messages
    ADD CONSTRAINT contact_messages_message_len
    CHECK (char_length(message) <= 5000) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
