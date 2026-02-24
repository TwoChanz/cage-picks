-- ============================================================================
-- 009 — Fix function search_path security warnings
-- ============================================================================
-- Sets explicit search_path on all functions to prevent search_path injection.
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- ============================================================================

alter function public.fight_event_not_started(uuid) set search_path = public;
alter function public.score_predictions_for_fight() set search_path = public;
alter function public.get_group_standings(uuid) set search_path = public;
alter function public.get_global_rank(uuid) set search_path = public;
