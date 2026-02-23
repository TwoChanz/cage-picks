# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FightNight OS — a UFC/MMA prediction app built with React Native (Expo). Users authenticate, browse upcoming fight cards, make predictions, join groups, and compete on leaderboards.

**Current status:** Auth, events list, event detail (fight cards), fighters list/detail, predictions UI, and Social tab (groups, standings, member lists) are functional. Profile sync (Clerk→Supabase) is implemented via `ProfileProvider`.

## Development Commands

```bash
npx expo start              # Start Expo dev server (press i for iOS, a for Android, w for Web)
npx expo start --ios        # Start and open iOS simulator
npx expo start --android    # Start and open Android emulator
npx expo start --web        # Start web preview (localhost:19006)
npx expo install --fix      # Fix dependency version mismatches
npx expo export --platform web  # Build static web output to /dist (used by Vercel)
```

Linting (`eslint .`) and testing (`jest`) are declared in package.json but **not configured** — no `.eslintrc` or `jest.config.js` exist.

**Supabase migrations** are in `supabase/migrations/` and numbered sequentially (`001_` through `007_`). Apply via `supabase db push` or the dashboard. No Edge Functions exist yet.

**EAS Build** is configured with three profiles in `eas.json`: `development` (dev client, internal), `preview` (internal), `production` (auto-increment).

## Architecture

**Framework:** Expo SDK 54, React Native 0.81, Expo Router 6 (file-based routing), TypeScript strict mode.

**Provider chain (app/_layout.tsx):**
```
ClerkProvider → ClerkLoaded → ProfileProvider → SafeAreaProvider → Stack
```

`ProfileProvider` is critical — it bridges Clerk auth to Supabase by injecting Clerk's JWT into Supabase fetch calls and ensuring a `profiles` row exists on first sign-in via `getOrCreateProfile()`.

**Navigation tree:**
```
Root Stack
├── index.tsx               # Auth redirect guard → /auth or /(tabs)/events
├── auth.tsx                # Clerk OAuth (Google + Apple via useSSO)
├── sso-callback.tsx        # OAuth redirect handler (post-Google/Apple)
└── (tabs)/                 # Bottom tab navigator, 4 tabs
    ├── events/             # Nested Stack: list → [slug] detail (with predictions UI)
    ├── fighters/           # Nested Stack: list → [slug] detail
    ├── social/             # Nested Stack: hub → group/[groupId] detail
    └── profile/            # Clerk user info, sign-out
```

**Data flow:** Clerk handles auth (sessions stored via `expo-secure-store`). Supabase is the database (PostgreSQL + RLS). No global state management — screens use local `useState` and call functions from `lib/`. Profile data is available globally via `useProfile()` context hook.

**Key data pattern — N+1 prevention in `lib/events.ts`:** Events and fights are fetched in exactly 2 queries (one for events, one for all related fights with fighter joins), then stitched together in JS via a `Map`. Follow this pattern for any new data access involving parent-child relationships.

**Auth → Supabase token flow:** Clerk generates a JWT → `ProfileProvider` calls `getToken({ template: "supabase" })` → `lib/supabase.ts` overrides `global.fetch` to inject `Authorization: Bearer {jwt}` on all Supabase requests → RLS policies check `auth.jwt() ->> 'sub'`.

**Mock data toggle:** `lib/fighters.ts` and `lib/predictions.ts` have a `USE_MOCK` boolean. Set `true` for offline development (in-memory data), `false` for live Supabase queries.

**Scoring system (DB trigger, migration 005):** When `fights.winner_id` is set, `score_predictions_for_fight()` fires automatically — awards 2 points for correct underdog picks (`was_favorite_at_pick = false`), 1 point for correct favorite picks.

## Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/lib/...`, `@/components/...`, `@/constants/...`, `@/types/...` for all imports.

## Key Files

| Path | Purpose |
|------|---------|
| `constants/theme.ts` | Design system: Colors, Spacing, FontSize, BorderRadius. Dark theme with red/orange accent palette. All `as const` objects. |
| `types/database.ts` | TypeScript interfaces matching every Supabase table. Must stay in sync with DB schema and migrations. |
| `lib/events.ts` | Data access for events/fights. Exports `getUpcomingEvents(count)`, `getEventBySlug(slug)`. |
| `lib/fighters.ts` | Data access for fighters. Exports `getFighters(weightClass?, search?)`, `getFighterBySlug(slug)`, `WEIGHT_CLASSES`. Has `USE_MOCK` toggle. |
| `lib/predictions.ts` | Predictions CRUD. Exports `getUserPredictionsForEvent`, `savePrediction`, `deletePrediction`, `isFightLocked`. Has `USE_MOCK` toggle. |
| `lib/profile.ts` | Profile creation & fetch. Exports `getOrCreateProfile(clerkUserId, {...})` with race condition handling. |
| `lib/supabase.ts` | Supabase client init + `global.fetch` override for JWT injection. Exports `setTokenResolver`/`clearTokenResolver`. Fails gracefully if env vars missing. |
| `lib/fighter-images.ts` | Maps fighter slugs to local `require()` images. Exports `getFighterImage(slug)`. |
| `lib/auth.ts` | Clerk token cache using `expo-secure-store` (native) or null (web). |
| `lib/notifications.ts` | Push notification registration, local scheduling. Uses `expo-notifications`. |
| `lib/groups.ts` | Groups CRUD, standings, invites, global rank. Exports `getUserGroups`, `getGroupDetail`, `getGroupStandings`, `createGroup`, `joinGroupByToken`, `getOrCreateGroupInvite`, `renameGroup`, `deleteGroup`, `getNextEventForBanner`, `getGlobalRank`, `computeEventBannerState`. |
| `lib/utils.ts` | Pure utilities: `formatRecord`, `cmToFeetInches`, `cmToInches`, `slugify`, `formatEventDate`. |
| `components/providers/profile-provider.tsx` | Context bridging Clerk→Supabase: JWT injection, profile sync, exposes `useProfile()` hook. |

## Components

Components live in `components/` organized by domain:

- **`components/events/`** — `event-card`, `fight-card`, `fight-row`, `countdown-timer`, `remind-me-toggle`, `add-to-calendar-button`
- **`components/fighters/`** — `fighter-card`
- **`components/social/`** — `group-card`, `event-banner`, `standings-list`, `member-list`, `create-group-modal`, `join-group-modal`
- **`components/providers/`** — `profile-provider`

`fight-row.tsx` resolves fighter images in priority order: local bundled image (`lib/fighter-images.ts`) → remote `image_url` from DB → placeholder icon.

**Platform-specific files:** Some components have `.web.tsx` variants (e.g., `remind-me-toggle.web.tsx`, `add-to-calendar-button.web.tsx`). React Native/Expo automatically loads `.web` files when building for web. Use this pattern when native and web need different implementations.

## Web/PWA Support

The app supports web deployment alongside native mobile:

- **`app/+html.tsx`** — Custom HTML shell for web exports (registers PWA manifest, service worker, Apple home screen tags)
- **`public/manifest.json`** — PWA manifest (standalone display, portrait orientation, dark theme)
- **`public/service-worker.js`** — Cache-first for static assets, network-first for HTML, network-only for API calls
- **`vercel.json`** — Vercel deployment config with SPA rewrites, cache headers, and build command that injects env vars

Deploy via `vercel` CLI or push to connected repo. Build command: `expo export --platform web` → output in `/dist`.

## Environment Variables

Requires a `.env` file (see `.env.example`):
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY      # Clerk dashboard → API Keys
EXPO_PUBLIC_SUPABASE_URL               # Supabase project → Connect
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # Supabase publishable key (public, RLS-protected)
```

All client-side vars must use the `EXPO_PUBLIC_` prefix to be bundled by Expo.

## Platform Constraints

Primary target is **native mobile** (iOS and Android) via Expo, with web/PWA as a secondary platform.

**Forbidden:**
- No Node.js-only libraries
- No direct Postgres connections from the client
- No Prisma or server-side ORM inside the app
- No server-only environment variables in frontend code
- No localhost dependencies

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
- **Path alias:** Always use `@/` imports, never relative paths like `../../lib/`.

## Database Schema

Seven migrations exist (`supabase/migrations/001_` through `007_`):

**Core tables:** `profiles`, `events`, `fighters`, `fights`, `predictions`, `groups`, `group_members`, `group_invites`, `fighter_favorites`, `meetup_nudges`, `meetup_responses`

**Key relationships:**
- `fights` → `events` (via `event_id`), `fighters` (via `fighter_a_id`, `fighter_b_id`, `favorite_fighter_id`)
- `predictions` → `profiles`, `fights`, `groups` (unique constraint on `profile_id, fight_id, group_id`)
- RLS enforced: users can only modify their own predictions, and only before the event starts (server-side lock via `fight_event_not_started()` function)

**Migration 005** adds prediction scoring: `favorite_fighter_id` on fights, `was_favorite_at_pick` on predictions, and a DB trigger that auto-scores when `winner_id` is set.
**Migration 006** adds profile INSERT policy for first-login sync.
**Migration 007** adds group RLS policies (member INSERT, owner UPDATE/DELETE, invite INSERT/UPDATE), `get_group_standings` and `get_global_rank` RPC functions, and a partial index on predictions for standings queries.

## Known Technical Debt

- `RemindMeToggle` uses an in-memory `Map` for reminder state — does not survive app relaunches.
- `date-fns` is installed but unused; `lib/utils.ts` uses native `Date` API.
- Missing production asset files: `icon.png` (1024x1024), `splash-icon.png`, `adaptive-icon.png`, `favicon.png`, `notification-icon.png` — required for EAS production builds.
- Group creation performs 3 sequential inserts (group, member, invite) without a transaction — acceptable for MVP, could wrap in an Edge Function later.
- Group standings query is fine for ~25 members but may need materialization for larger groups.
