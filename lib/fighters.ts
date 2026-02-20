/**
 * Fighters Data Access Layer
 *
 * All Supabase queries for fighters live here, keeping database logic
 * out of screens and components.
 *
 * MOCK DATA:
 * Supabase is currently paused. Mock data is included so the UI is
 * visible and testable without a database connection. When Supabase
 * is active, set USE_MOCK to false and the real queries will run.
 */
import { supabase } from "@/lib/supabase"
import type { Fighter } from "@/types/database"

// ── Toggle for mock vs. live data ──
const USE_MOCK = false

// ── Weight class constants ──
export const WEIGHT_CLASSES = [
  "All",
  "Heavyweight",
  "Light Heavyweight",
  "Middleweight",
  "Welterweight",
  "Lightweight",
  "Featherweight",
  "Bantamweight",
  "Flyweight",
] as const

export type WeightClass = (typeof WEIGHT_CLASSES)[number]

// ── Mock data: 6 realistic UFC fighters ──
const MOCK_FIGHTERS: Fighter[] = [
  {
    id: "f1",
    name: "Islam Makhachev",
    nickname: "The Eagle's Protege",
    slug: "islam-makhachev",
    weight_class: "Lightweight",
    record_wins: 27,
    record_losses: 1,
    record_draws: 0,
    record_nc: 0,
    height_cm: 178,
    reach_cm: 178,
    stance: "Southpaw",
    ko_percentage: 18,
    sub_percentage: 41,
    dec_percentage: 41,
    current_win_streak: 15,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f2",
    name: "Alex Pereira",
    nickname: "Poatan",
    slug: "alex-pereira",
    weight_class: "Light Heavyweight",
    record_wins: 12,
    record_losses: 2,
    record_draws: 0,
    record_nc: 0,
    height_cm: 193,
    reach_cm: 203,
    stance: "Orthodox",
    ko_percentage: 75,
    sub_percentage: 0,
    dec_percentage: 25,
    current_win_streak: 5,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f3",
    name: "Jon Jones",
    nickname: "Bones",
    slug: "jon-jones",
    weight_class: "Heavyweight",
    record_wins: 28,
    record_losses: 1,
    record_draws: 0,
    record_nc: 1,
    height_cm: 193,
    reach_cm: 215,
    stance: "Orthodox",
    ko_percentage: 36,
    sub_percentage: 25,
    dec_percentage: 39,
    current_win_streak: 1,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f4",
    name: "Sean O'Malley",
    nickname: "Suga",
    slug: "sean-omalley",
    weight_class: "Bantamweight",
    record_wins: 18,
    record_losses: 2,
    record_draws: 0,
    record_nc: 1,
    height_cm: 180,
    reach_cm: 183,
    stance: "Switch",
    ko_percentage: 56,
    sub_percentage: 6,
    dec_percentage: 38,
    current_win_streak: 0,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f5",
    name: "Ilia Topuria",
    nickname: "El Matador",
    slug: "ilia-topuria",
    weight_class: "Featherweight",
    record_wins: 16,
    record_losses: 0,
    record_draws: 0,
    record_nc: 0,
    height_cm: 170,
    reach_cm: 173,
    stance: "Orthodox",
    ko_percentage: 50,
    sub_percentage: 25,
    dec_percentage: 25,
    current_win_streak: 16,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f6",
    name: "Dricus Du Plessis",
    nickname: "Stillknocks",
    slug: "dricus-du-plessis",
    weight_class: "Middleweight",
    record_wins: 22,
    record_losses: 2,
    record_draws: 0,
    record_nc: 0,
    height_cm: 180,
    reach_cm: 191,
    stance: "Orthodox",
    ko_percentage: 59,
    sub_percentage: 18,
    dec_percentage: 23,
    current_win_streak: 10,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f7",
    name: "Magomed Ankalaev",
    nickname: "The Machine",
    slug: "magomed-ankalaev",
    weight_class: "Light Heavyweight",
    record_wins: 19,
    record_losses: 1,
    record_draws: 1,
    record_nc: 1,
    height_cm: 191,
    reach_cm: 188,
    stance: "Orthodox",
    ko_percentage: 47,
    sub_percentage: 11,
    dec_percentage: 42,
    current_win_streak: 4,
    image_url: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

/**
 * Fetch fighters with optional weight class and search filters.
 *
 * When Supabase is active, this runs a single query with
 * optional .eq() and .ilike() filters. While paused, it
 * filters the mock array in JavaScript.
 *
 * @param weightClass - Filter by division (omit or "All" for all)
 * @param search - Case-insensitive name search string
 */
export async function getFighters(
  weightClass?: string,
  search?: string
): Promise<Fighter[]> {
  if (USE_MOCK) {
    return filterMockFighters(weightClass, search)
  }

  let query = supabase
    .from("fighters")
    .select("*")
    .order("name", { ascending: true })

  if (weightClass && weightClass !== "All") {
    query = query.eq("weight_class", weightClass)
  }

  if (search && search.trim().length > 0) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to fetch fighters:", error)
    return []
  }

  return (data as Fighter[]) ?? []
}

/**
 * Fetch a single fighter by their URL slug.
 *
 * @param slug - URL-friendly fighter identifier (e.g., "islam-makhachev")
 */
export async function getFighterBySlug(
  slug: string
): Promise<Fighter | null> {
  if (USE_MOCK) {
    return MOCK_FIGHTERS.find((f) => f.slug === slug) ?? null
  }

  const { data, error } = await supabase
    .from("fighters")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) return null

  return data as Fighter
}

// ── Helper: filter mock data in-memory ──
function filterMockFighters(
  weightClass?: string,
  search?: string
): Fighter[] {
  let results = [...MOCK_FIGHTERS]

  if (weightClass && weightClass !== "All") {
    results = results.filter((f) => f.weight_class === weightClass)
  }

  if (search && search.trim().length > 0) {
    const term = search.trim().toLowerCase()
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        (f.nickname && f.nickname.toLowerCase().includes(term))
    )
  }

  return results.sort((a, b) => a.name.localeCompare(b.name))
}
