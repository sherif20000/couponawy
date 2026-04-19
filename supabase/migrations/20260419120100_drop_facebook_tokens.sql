-- Drop unused facebook_tokens table.
-- Verified 2026-04-19: 0 rows, no inbound FKs (only its own PK + outbound FK to auth.users).
-- Not part of the couponawy data model — leftover from an earlier project scaffold.

DROP TABLE IF EXISTS public.facebook_tokens;
