/**
 * Supabase Client for React Native
 *
 * In React Native, we don't have a "browser" vs "server" distinction
 * like in Next.js. Instead, we have one client that runs on the device.
 *
 * This client uses the publishable key (public, limited by RLS policies).
 * For admin operations, use Supabase Edge Functions on the server side.
 *
 * IMPORTANT: Environment variables in Expo use a different prefix than Next.js.
 * - Next.js used: NEXT_PUBLIC_SUPABASE_URL
 * - Expo uses: EXPO_PUBLIC_SUPABASE_URL
 *
 * The EXPO_PUBLIC_ prefix tells Expo to include these in the app bundle
 * (they're safe to expose — the publishable key is public by design,
 * and RLS policies protect the data).
 */
import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"
import "expo-sqlite/localStorage/install"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ""
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
