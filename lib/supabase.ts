/**
 * Supabase Client for React Native
 *
 * In React Native, we don't have a "browser" vs "server" distinction
 * like in Next.js. Instead, we have one client that runs on the device.
 *
 * This client uses the ANON key (public, limited by RLS policies).
 * For admin operations, use Supabase Edge Functions on the server side.
 *
 * IMPORTANT: Environment variables in Expo use a different prefix than Next.js.
 * - Next.js used: NEXT_PUBLIC_SUPABASE_URL
 * - Expo uses: EXPO_PUBLIC_SUPABASE_URL
 *
 * The EXPO_PUBLIC_ prefix tells Expo to include these in the app bundle
 * (they're safe to expose — the anon key is public by design, and RLS
 * policies protect the data).
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
