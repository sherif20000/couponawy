-- Follow-up to 20260525020000_supabase_hardening.sql
--
-- The first sweep revoked EXECUTE on handle_new_user + notify_revalidate from
-- the `anon` role explicitly. The security advisor kept flagging them as
-- anon-callable anyway, and inspection of pg_proc.proacl showed why:
--
--   {=X/postgres,postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}
--
-- The leading `=X/postgres` is the PUBLIC grant. `anon` (and every role) inherits
-- PUBLIC's permissions — so a per-anon revoke is a no-op as long as PUBLIC still
-- holds EXECUTE.
--
-- Both functions are trigger-only (handle_new_user fires on auth.users insert;
-- notify_revalidate fires on admin row writes). Triggers run with the function
-- owner's privileges because both are SECURITY DEFINER — so revoking caller's
-- EXECUTE doesn't break the trigger path, only the /rest/v1/rpc/{name} RPC
-- surface, which neither function should ever expose.
revoke execute on function public.handle_new_user() from public, authenticated, anon;
revoke execute on function public.notify_revalidate() from public, authenticated, anon;

-- Explicit grant to service_role for completeness (Vercel cron / admin scripts).
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.notify_revalidate() to service_role;
