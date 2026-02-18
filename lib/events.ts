/**
 * Events Data Access Layer
 *
 * All Supabase queries for events, fights, and fighters live here.
 * This keeps database logic in one place instead of scattered across
 * screens and components.
 *
 * KEY CONCEPT — Avoiding N+1 Queries:
 * If we had 5 events and fetched fights for each one separately,
 * that would be 1 + 5 = 6 database calls (the "N+1 problem").
 * Instead, we fetch ALL fights for ALL events in one query, then
 * stitch them together in JavaScript. Result: always 2 queries total.
 */
import { supabase } from "@/lib/supabase"
import type { Event, Fighter, Fight, FightWithFighters } from "@/types/database"

/**
 * An event with all its fights (and fighter data) pre-loaded.
 * This is the shape of data that the Events screen receives.
 */
export interface EventWithFights extends Event {
  fights: FightWithFighters[]
}

/**
 * Fetch the next N upcoming events, each with its full fight card.
 *
 * QUERY STRATEGY (2 database round-trips, never more):
 * 1. Fetch events WHERE status='upcoming' ORDER BY date LIMIT count
 * 2. Fetch ALL fights for those event IDs, joining fighter data
 * 3. Group fights by event_id in JavaScript
 *
 * @param count - How many events to fetch (default 5)
 */
export async function getUpcomingEvents(count = 5): Promise<EventWithFights[]> {
  // Query 1: Get upcoming events sorted by date
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("status", "upcoming")
    .order("date", { ascending: true })
    .limit(count)

  if (eventsError || !events?.length) return []

  // Query 2: Get all fights for these events, with fighter data joined
  // The syntax fighters!fighter_a_id(*) tells Supabase:
  // "Join the fighters table using the fighter_a_id foreign key and return all columns"
  const eventIds = events.map((e) => e.id)
  const { data: fights, error: fightsError } = await supabase
    .from("fights")
    .select(`
      *,
      fighter_a:fighters!fighter_a_id(*),
      fighter_b:fighters!fighter_b_id(*)
    `)
    .in("event_id", eventIds)
    .order("fight_order", { ascending: false })

  if (fightsError) {
    // If fights fail to load, return events without fights
    return events.map((e) => ({ ...e, fights: [] }))
  }

  // Stitch fights onto their parent events
  const fightsByEvent = new Map<string, FightWithFighters[]>()
  for (const fight of fights ?? []) {
    const list = fightsByEvent.get(fight.event_id) ?? []
    list.push(fight as FightWithFighters)
    fightsByEvent.set(fight.event_id, list)
  }

  return events.map((event) => ({
    ...event,
    fights: fightsByEvent.get(event.id) ?? [],
  }))
}

/**
 * Fetch a single event by its URL slug, with full fight card.
 * Used on the event detail screen.
 *
 * @param slug - The URL-friendly event identifier (e.g., "ufc-314")
 */
export async function getEventBySlug(slug: string): Promise<EventWithFights | null> {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single()

  if (eventError || !event) return null

  const { data: fights } = await supabase
    .from("fights")
    .select(`
      *,
      fighter_a:fighters!fighter_a_id(*),
      fighter_b:fighters!fighter_b_id(*)
    `)
    .eq("event_id", event.id)
    .order("fight_order", { ascending: false })

  return {
    ...event,
    fights: (fights as FightWithFighters[]) ?? [],
  }
}
