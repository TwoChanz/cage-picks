-- ============================================================================
-- FightNight OS — Initial Database Schema
-- ============================================================================
-- This file creates all the database tables the app needs.
-- Run this in your Supabase SQL editor to set up the database.
--
-- TABLE RELATIONSHIPS (how data connects):
--
--   profiles ──────┬──── fighter_favorites (which fighters a user follows)
--     (users)      ├──── group_members (which groups a user belongs to)
--                  ├──── predictions (which fighter a user picked to win)
--                  └──── meetup_responses (in/out/maybe for watch parties)
--
--   events ────────┬──── fights (each event has multiple fights)
--     (UFC cards)  └──── meetup_nudges (watch party prompts per event)
--
--   fighters ──────┬──── fights (as fighter_a or fighter_b)
--                  └──── fighter_favorites (users who follow this fighter)
--
--   groups ────────┬──── group_members (who's in the group)
--     (crews)      ├──── group_invites (shareable join links)
--                  └──── meetup_nudges (per-event watch party prompts)
-- ============================================================================


-- --------------------------------------------------------------------------
-- PROFILES
-- --------------------------------------------------------------------------
-- Extends the Clerk user with app-specific data.
-- When someone signs up via Clerk, we create a row here to store their
-- display name, avatar, and FightNight-specific info like their title.
--
-- "Why not just use Clerk's user data?" Because Clerk handles auth (login),
-- but we need a place in OUR database to link users to predictions, groups, etc.
-- --------------------------------------------------------------------------
create table profiles (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,        -- Links to Clerk's user ID
  username      text unique not null,
  display_name  text not null,
  avatar_url    text,
  title         text default 'Fight Fan',    -- Dynamic title from leaderboard (e.g. "The Oracle")
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index = makes lookups by clerk_user_id fast (like a book's index)
create index idx_profiles_clerk_user_id on profiles (clerk_user_id);


-- --------------------------------------------------------------------------
-- EVENTS
-- --------------------------------------------------------------------------
-- Each row is a UFC event (e.g., "UFC 310: Pantoja vs. Asakura").
-- The dashboard shows the next 3-5 upcoming events.
-- Events have a status lifecycle: upcoming → live → completed.
-- --------------------------------------------------------------------------
create table events (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                 -- "UFC 310: Pantoja vs. Asakura"
  slug          text unique not null,          -- "ufc-310" (URL-friendly version)
  date          timestamptz not null,          -- When the event starts (UTC)
  location      text,                          -- "T-Mobile Arena, Las Vegas"
  status        text default 'upcoming'        -- upcoming | live | completed
                check (status in ('upcoming', 'live', 'completed')),
  image_url     text,                          -- Event poster/promo image
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index idx_events_status on events (status);
create index idx_events_date on events (date);


-- --------------------------------------------------------------------------
-- FIGHTERS
-- --------------------------------------------------------------------------
-- Each row is a fighter with their stats.
-- The PRD calls for: name, nickname, record, height, reach, stance,
-- finish breakdown (KO/Sub/Decision %), win streak, and last 5 results.
-- --------------------------------------------------------------------------
create table fighters (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,               -- "Jon Jones"
  nickname          text,                        -- "Bones"
  slug              text unique not null,        -- "jon-jones"
  weight_class      text,                        -- "Heavyweight"
  record_wins       int default 0,
  record_losses     int default 0,
  record_draws      int default 0,
  record_nc         int default 0,               -- No contests
  height_cm         int,                         -- Height in centimeters
  reach_cm          int,                         -- Reach in centimeters
  stance            text,                        -- "Orthodox" | "Southpaw" | "Switch"
  ko_percentage     numeric(5,2) default 0,      -- % of wins by knockout
  sub_percentage    numeric(5,2) default 0,      -- % of wins by submission
  dec_percentage    numeric(5,2) default 0,      -- % of wins by decision
  current_win_streak int default 0,
  image_url         text,                        -- Fighter headshot
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index idx_fighters_slug on fighters (slug);
create index idx_fighters_weight_class on fighters (weight_class);


-- --------------------------------------------------------------------------
-- FIGHTS
-- --------------------------------------------------------------------------
-- A single fight between two fighters within an event.
-- Each event (UFC card) has multiple fights. This is where predictions
-- get resolved — when a fight is scored, we know who picked correctly.
-- --------------------------------------------------------------------------
create table fights (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events (id) on delete cascade,
  fighter_a_id    uuid not null references fighters (id),
  fighter_b_id    uuid not null references fighters (id),
  card_position   text default 'main'          -- main | prelim | early-prelim
                  check (card_position in ('main', 'prelim', 'early-prelim')),
  fight_order     int default 0,               -- Order within the card (higher = later)
  is_main_event   boolean default false,
  weight_class    text,
  scheduled_rounds int default 3,               -- 3 or 5 rounds
  status          text default 'upcoming'       -- upcoming | live | completed | cancelled
                  check (status in ('upcoming', 'live', 'completed', 'cancelled')),
  winner_id       uuid references fighters (id), -- NULL until fight is scored
  method          text,                         -- "KO/TKO" | "Submission" | "Decision" | "Split Decision"
  round           int,                          -- What round it ended
  time            text,                         -- "4:32" time in round
  started_at      timestamptz,                  -- When the fight actually started (for pick locking)
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_fights_event_id on fights (event_id);
create index idx_fights_status on fights (status);


-- --------------------------------------------------------------------------
-- FIGHTER FAVORITES
-- --------------------------------------------------------------------------
-- When a user "follows" a fighter, a row is created here.
-- Used to send push notifications when a followed fighter gets booked.
-- --------------------------------------------------------------------------
create table fighter_favorites (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  fighter_id  uuid not null references fighters (id) on delete cascade,
  created_at  timestamptz default now(),
  unique (profile_id, fighter_id)  -- Can't follow the same fighter twice
);

create index idx_fighter_favorites_profile on fighter_favorites (profile_id);


-- --------------------------------------------------------------------------
-- GROUPS
-- --------------------------------------------------------------------------
-- A friend group (crew). Users create a group and share an invite link.
-- The PRD says groups are private by default, one user can be in multiple groups.
-- --------------------------------------------------------------------------
create table groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                 -- "The Boyz" or whatever they name it
  created_by   uuid not null references profiles (id),
  image_url    text,                          -- Optional group avatar
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);


-- --------------------------------------------------------------------------
-- GROUP MEMBERS
-- --------------------------------------------------------------------------
-- Tracks who is in each group and their role (owner vs member).
-- The group creator is automatically an "owner". Everyone else is a "member".
-- --------------------------------------------------------------------------
create table group_members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  role        text default 'member'           -- owner | member
              check (role in ('owner', 'member')),
  joined_at   timestamptz default now(),
  unique (group_id, profile_id)  -- Can't join the same group twice
);

create index idx_group_members_group on group_members (group_id);
create index idx_group_members_profile on group_members (profile_id);


-- --------------------------------------------------------------------------
-- GROUP INVITES
-- --------------------------------------------------------------------------
-- Shareable invite links. Each invite has a unique token (UUID).
-- The invite URL looks like: fightnightos.app/invite/abc123-def456
-- When someone opens it, they sign in and auto-join the group.
-- --------------------------------------------------------------------------
create table group_invites (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups (id) on delete cascade,
  token       uuid unique not null default gen_random_uuid(),  -- The shareable token
  created_by  uuid not null references profiles (id),
  expires_at  timestamptz,                    -- Optional expiration
  max_uses    int,                            -- Optional use limit
  use_count   int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create index idx_group_invites_token on group_invites (token);


-- --------------------------------------------------------------------------
-- PREDICTIONS
-- --------------------------------------------------------------------------
-- The core social mechanic. Before a fight, each group member picks a winner.
-- Picks are visible to the group in real time. Picks lock when the fight starts.
--
-- SCORING (from PRD):
--   Correct pick on a favorite: 1 point
--   Correct pick on an underdog: 2 points
-- --------------------------------------------------------------------------
create table predictions (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references profiles (id) on delete cascade,
  fight_id        uuid not null references fights (id) on delete cascade,
  group_id        uuid references groups (id) on delete cascade,  -- NULL = public prediction
  picked_fighter_id uuid not null references fighters (id),
  is_correct      boolean,                    -- NULL until fight is scored
  points_earned   int default 0,              -- 0, 1, or 2 depending on favorite/underdog
  locked_at       timestamptz,                -- When the pick was locked (fight start time)
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  -- Each user can only pick once per fight per group
  unique (profile_id, fight_id, group_id)
);

create index idx_predictions_fight on predictions (fight_id);
create index idx_predictions_profile on predictions (profile_id);
create index idx_predictions_group on predictions (group_id);


-- --------------------------------------------------------------------------
-- MEETUP NUDGES
-- --------------------------------------------------------------------------
-- Before a fight card, a push goes out asking "Who's in this weekend?"
-- Group members respond: In / Out / Maybe.
-- --------------------------------------------------------------------------
create table meetup_nudges (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups (id) on delete cascade,
  event_id    uuid not null references events (id) on delete cascade,
  created_at  timestamptz default now(),
  unique (group_id, event_id)  -- One nudge per group per event
);

create table meetup_responses (
  id          uuid primary key default gen_random_uuid(),
  nudge_id    uuid not null references meetup_nudges (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  response    text not null                   -- in | out | maybe
              check (response in ('in', 'out', 'maybe')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (nudge_id, profile_id)  -- One response per person per nudge
);

create index idx_meetup_responses_nudge on meetup_responses (nudge_id);


-- --------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------------
-- RLS is Supabase's way of protecting data. Without it, anyone could
-- read/write anything. With RLS, each table has rules about who can
-- do what. We enable it on every table and add policies later.
-- --------------------------------------------------------------------------
alter table profiles enable row level security;
alter table events enable row level security;
alter table fighters enable row level security;
alter table fights enable row level security;
alter table fighter_favorites enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_invites enable row level security;
alter table predictions enable row level security;
alter table meetup_nudges enable row level security;
alter table meetup_responses enable row level security;

-- Events and fighters are public read (anyone can see the schedule and fighter stats)
create policy "Events are viewable by everyone"
  on events for select using (true);

create policy "Fighters are viewable by everyone"
  on fighters for select using (true);

create policy "Fights are viewable by everyone"
  on fights for select using (true);

-- Profiles are viewable by authenticated users
create policy "Profiles are viewable by authenticated users"
  on profiles for select using (auth.role() = 'authenticated');

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update using (
    clerk_user_id = auth.jwt() ->> 'sub'
  );

-- Fighter favorites: users manage their own
create policy "Users can view own favorites"
  on fighter_favorites for select using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "Users can insert own favorites"
  on fighter_favorites for insert with check (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "Users can delete own favorites"
  on fighter_favorites for delete using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- Predictions: visible to group members, users manage their own
create policy "Users can view predictions in their groups"
  on predictions for select using (
    group_id is null  -- public predictions visible to all
    or group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "Users can insert own predictions"
  on predictions for insert with check (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- Groups: members can view their groups
create policy "Users can view their groups"
  on groups for select using (
    id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "Authenticated users can create groups"
  on groups for insert with check (
    created_by in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- Group members: visible within the group
create policy "Group members can view their group members"
  on group_members for select using (
    group_id in (
      select group_id from group_members gm
      where gm.profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

-- Group invites: anyone with the token can view (for joining)
create policy "Active invites are viewable by token"
  on group_invites for select using (is_active = true);

-- Meetup responses: visible to group members
create policy "Meetup nudges visible to group members"
  on meetup_nudges for select using (
    group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "Meetup responses visible to group members"
  on meetup_responses for select using (
    nudge_id in (
      select id from meetup_nudges
      where group_id in (
        select group_id from group_members
        where profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "Users can insert own meetup response"
  on meetup_responses for insert with check (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "Users can update own meetup response"
  on meetup_responses for update using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );
