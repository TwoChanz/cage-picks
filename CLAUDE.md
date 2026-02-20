# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FightNight OS — a UFC/MMA prediction app built with React Native (Expo). Users authenticate, browse upcoming fight cards, make predictions, join groups, and compete on leaderboards.

**Current status:** Auth, events list, event detail (fight cards), and fighters list/detail are functional. Predictions, groups, and leaderboard are placeholders. Clerk-to-Supabase profile sync is not yet implemented.

## Development Commands

```bash
npx expo start              # Start Expo dev server (press i for iOS, a for Android)
npx expo start --ios        # Start and open iOS simulator
npx expo start --android    # Start and open Android emulator
npx expo install --fix      # Fix dependency version mismatches
```

Linting (`eslint .`) and testing (`jest`) are declared in package.json but **not configured** — no `.eslintrc` or `jest.config.js` exist.

**Supabase migrations** are in `supabase/migrations/` and numbered sequentially (`001_`, `002_`, etc.). Apply via the Supabase CLI or dashboard. No Edge Functions exist yet.

**EAS Build** is configured with three profiles in `eas.json`: `development` (dev client, internal), `preview` (internal), `production` (auto-increment).

## Architecture

**Framework:** Expo SDK 54, React Native 0.81, Expo Router 6 (file-based routing), TypeScript strict mode.

**Navigation tree:**
```
RootLayout (ClerkProvider → SafeAreaProvider → Stack)
├── index.tsx               # Auth redirect guard → /auth or /(tabs)/events
├── auth.tsx                # Clerk OAuth (Google + Apple via useSSO)
└── (tabs)/                 # Bottom tab navigator, 5 tabs
    ├── events/             # Nested Stack: list → [slug] detail
    ├── fighters/           # Nested Stack: list → [slug] detail
    ├── groups/             # Placeholder (Phase 3)
    ├── leaderboard/        # Placeholder (Phase 4)
    └── profile/            # Clerk user info, sign-out
```

**Data flow:** Clerk handles auth (sessions stored via `expo-secure-store`). Supabase is the database (PostgreSQL + RLS). No global state management — screens use local `useState` and call functions from `lib/`.

**Key data pattern — N+1 prevention in `lib/events.ts`:** Events and fights are fetched in exactly 2 queries (one for events, one for all related fights with fighter joins), then stitched together in JS via a `Map`. Follow this pattern for any new data access involving parent-child relationships.

**Auth pattern:** Clerk's `useSSO()` hook with `startSSOFlow({ strategy: "oauth_google" | "oauth_apple" })`. On success, `setActive({ session: createdSessionId })` then navigate. Supabase RLS policies use `auth.jwt() ->> 'sub'` to match Clerk user IDs — but no Clerk→Supabase `profiles` table sync exists yet.

## Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/lib/...`, `@/components/...`, `@/constants/...`, `@/types/...` for all imports.

## Key Files

| Path | Purpose |
|------|---------|
| `constants/theme.ts` | Design system: Colors, Spacing, FontSize, BorderRadius. Dark theme with red/orange accent palette. All `as const` objects. |
| `types/database.ts` | TypeScript interfaces matching every Supabase table. Must stay in sync with DB schema and migrations. |
| `lib/events.ts` | Data access for events/fights. Exports `getUpcomingEvents(count)`, `getEventBySlug(slug)`. |
| `lib/fighters.ts` | Data access for fighters. Exports `getFighters(weightClass?, search?)`, `getFighterBySlug(slug)`, `WEIGHT_CLASSES`, `WeightClass`. Has a `USE_MOCK` toggle for offline dev. |
| `lib/fighter-images.ts` | Maps fighter slugs to local `require()` images. Exports `getFighterImage(slug)`. Add new entries here when bundling fighter images locally. |
| `lib/notifications.ts` | Push notification registration, local scheduling for event reminders. Uses `expo-notifications`. |
| `lib/utils.ts` | Pure utilities: `formatRecord`, `cmToFeetInches`, `cmToInches`, `slugify`, `formatEventDate`. |
| `lib/auth.ts` | Clerk token cache using `expo-secure-store`. |
| `lib/supabase.ts` | Supabase client init. Fails gracefully to a placeholder client if env vars are missing. |

## Components

Components live in `components/` organized by domain:

- **`components/events/`** — `event-card`, `fight-card`, `fight-row`, `countdown-timer`, `remind-me-toggle`, `add-to-calendar-button`
- **`components/fighters/`** — `fighter-card`

`fight-row.tsx` resolves fighter images in priority order: local bundled image (`lib/fighter-images.ts`) → remote `image_url` from DB → placeholder icon.

## Environment Variables

Requires a `.env` file (see `.env.example`):
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY      # Clerk dashboard → API Keys
EXPO_PUBLIC_SUPABASE_URL               # Supabase project → Connect
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # Supabase publishable key (public, RLS-protected)
```

All client-side vars must use the `EXPO_PUBLIC_` prefix to be bundled by Expo.

## Platform Constraints

This is a **native mobile application** (iOS and Android) built with Expo. It is NOT a web-first project.

**Forbidden:**
- No Node.js-only libraries
- No direct Postgres connections from the client
- No Prisma or server-side ORM inside the app
- No server-only environment variables in frontend code
- No localhost dependencies
- No heavy web-only packages

**Architecture rules:**
- Mobile app = frontend only. Supabase = backend + database layer.
- All database communication goes through Supabase via `@supabase/supabase-js`.
- If server logic is required, use Supabase Edge Functions.
- Must run inside Expo Go without crashing on both iOS and Android.
- Real device testing takes priority over web preview.

**Validation check:** Before suggesting any code or dependency, ask: *"Will this run inside Expo Go on iPhone?"*

## Conventions

- **Styling:** React Native `StyleSheet.create` — no CSS. Use values from `constants/theme.ts` (Colors, Spacing, FontSize, BorderRadius), never hardcode.
- **Database types:** Add new table interfaces to `types/database.ts`. Keep them in sync with Supabase migrations.
- **Data access:** Keep Supabase queries in `lib/` files, not in components or screens.
- **New screens:** Add as files under `app/` following Expo Router file-based routing conventions.
- **Dark-only theme:** `userInterfaceStyle` is `"dark"`. The app does not support light mode.
- **Portrait-locked:** Orientation is fixed to portrait.

## Known Technical Debt

- Tab bar in `app/(tabs)/_layout.tsx` hardcodes colors instead of using `constants/theme.ts`.
- `RemindMeToggle` uses an in-memory `Map` for reminder state — does not survive app relaunches.
- `date-fns` is installed but unused; `lib/utils.ts` uses native `Date` API.
- No Clerk → Supabase `profiles` table sync (needed before predictions feature).
