-- Fix: reveal_coupon() failed with "function digest(text, unknown) does not exist"
-- because SET search_path TO 'public' excluded the extensions schema where
-- pgcrypto (and therefore digest()) lives.
--
-- Applied to qoyusdbvarlzkpxktpsl on 2026-04-19 via Supabase MCP.

ALTER FUNCTION public.reveal_coupon(uuid, text, text, text)
  SET search_path = public, extensions;
