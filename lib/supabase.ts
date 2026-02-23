/**
 * Supabase Client for React Native
 *
 * In React Native, we don't have a "browser" vs "server" distinction
 * like in Next.js. Instead, we have one client that runs on the device.
 *
 * This client uses the publishable key (public, limited by RLS policies).
 * For admin operations, use Supabase Edge Functions on the server side.
 *
 * AUTH INTEGRATION:
 * Clerk handles authentication. We inject Clerk's JWT into every Supabase
 * request via a global.fetch override. Call setTokenResolver() with a
 * function that returns the Clerk JWT, and every Supabase request will
 * automatically include it as the Authorization header. This lets the
 * singleton client work for both anonymous and authenticated requests.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// ── Token resolver for Clerk JWT injection ──
type TokenResolver = () => Promise<string | null>
let _tokenResolver: TokenResolver | null = null

/**
 * Set the function that provides Clerk JWTs for Supabase requests.
 * Call this when the user signs in.
 */
export function setTokenResolver(resolver: TokenResolver) {
  _tokenResolver = resolver
}

/**
 * Clear the token resolver when the user signs out.
 */
export function clearTokenResolver() {
  _tokenResolver = null
}

// ── Fetch override that injects the auth header ──
const _originalFetch = global.fetch

const supabaseFetch: typeof global.fetch = async (input, init) => {
  // Only inject on Supabase requests
  if (_tokenResolver && supabaseUrl) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url
    if (url.startsWith(supabaseUrl)) {
      const token = await _tokenResolver()
      if (token) {
        const headers = new Headers(init?.headers)
        headers.set("Authorization", `Bearer ${token}`)
        return _originalFetch(input, { ...init, headers })
      }
    }
  }
  return _originalFetch(input, init)
}

global.fetch = supabaseFetch

function initSupabase(): SupabaseClient {
  try {
    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error("Missing Supabase env vars")
    }
    return createClient(supabaseUrl.trim(), supabasePublishableKey.trim())
  } catch {
    // Graceful fallback for static rendering (Expo export) and missing env vars.
    // Queries will fail but the app won't crash during build or first load.
    return new Proxy({} as SupabaseClient, {
      get: (_target, prop) => {
        if (prop === "from") return () => ({
          select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null }), order: () => ({ data: [], error: null }) }),
          insert: () => ({ data: null, error: { message: "Supabase not configured" } }),
          update: () => ({ data: null, error: { message: "Supabase not configured" } }),
          delete: () => ({ data: null, error: { message: "Supabase not configured" } }),
        })
        if (prop === "auth") return { getSession: () => ({ data: { session: null }, error: null }) }
        return () => {}
      },
    })
  }
}

export const supabase = initSupabase()
