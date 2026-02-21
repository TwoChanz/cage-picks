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
 *
 * AUTH INTEGRATION:
 * setTokenResolver / clearTokenResolver inject Clerk's JWT into every
 * Supabase request via a global.fetch override. This keeps the singleton
 * export pattern intact — all existing lib/*.ts imports work unchanged.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// ── Token resolver for Clerk JWT injection ──
type TokenResolver = () => Promise<string | null>
let _tokenResolver: TokenResolver | null = null

/**
 * Register a function that returns the current Clerk JWT.
 * Called by ProfileProvider when the user signs in.
 */
export function setTokenResolver(resolver: TokenResolver) {
  _tokenResolver = resolver
}

/**
 * Clear the token resolver on sign-out.
 */
export function clearTokenResolver() {
  _tokenResolver = null
}

// ── Patched fetch that injects the Authorization header ──
const _originalFetch = global.fetch

const patchedFetch: typeof global.fetch = async (input, init) => {
  // Only inject token for requests to our Supabase instance
  if (_tokenResolver && supabaseUrl) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url
    if (url.startsWith(supabaseUrl)) {
      const token = await _tokenResolver()
      if (token) {
        const headers = new Headers(init?.headers)
        headers.set("Authorization", `Bearer ${token}`)
        init = { ...init, headers }
      }
    }
  }
  return _originalFetch(input, init)
}

global.fetch = patchedFetch

function initSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    console.error(
      "Missing Supabase env vars:",
      !supabaseUrl ? "EXPO_PUBLIC_SUPABASE_URL" : "",
      !supabasePublishableKey ? "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY" : ""
    )
    // Return a client with placeholder values to avoid crash — queries will fail gracefully
    return createClient("https://placeholder.supabase.co", "placeholder")
  }
  return createClient(supabaseUrl, supabasePublishableKey)
}

export const supabase = initSupabase()
