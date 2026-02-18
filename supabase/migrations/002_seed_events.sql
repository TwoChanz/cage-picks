-- ============================================================================
-- FightNight OS — Seed Data for Development
-- ============================================================================
-- This file inserts realistic UFC event data so you can build and test
-- the Events Dashboard without needing a live data source.
--
-- Run this in your Supabase SQL editor AFTER 001_initial_schema.sql.
--
-- DATES: Set in the future relative to Feb 2026 so countdowns work.
-- FIGHTERS: Real UFC fighters with approximate stats.
-- ============================================================================

DO $$
DECLARE
  -- Fighter IDs (we capture them with RETURNING so fights can reference them)
  v_makhachev     uuid;
  v_tsarukyan     uuid;
  v_pereira       uuid;
  v_ankalaev      uuid;
  v_dvalishvili   uuid;
  v_nurmagomedov  uuid;
  v_duplessis     uuid;
  v_strickland    uuid;
  v_topuria       uuid;
  v_holloway      uuid;
  v_pantoja       uuid;
  v_royval        uuid;

  -- Event IDs
  v_ufc314        uuid;
  v_fn_mar        uuid;
  v_ufc315        uuid;
  v_fn_may        uuid;

BEGIN

  -- ========================================================================
  -- INSERT FIGHTERS
  -- ========================================================================

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Islam Makhachev', 'Borz', 'islam-makhachev', 'Lightweight', 27, 1, 0, 0, 178, 178, 'Orthodox', 18.5, 40.7, 40.8, 14)
  RETURNING id INTO v_makhachev;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Arman Tsarukyan', 'Ahalkalakets', 'arman-tsarukyan', 'Lightweight', 22, 3, 0, 0, 178, 183, 'Orthodox', 31.8, 13.6, 54.6, 8)
  RETURNING id INTO v_tsarukyan;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Alex Pereira', 'Poatan', 'alex-pereira', 'Light Heavyweight', 12, 2, 0, 0, 193, 196, 'Orthodox', 83.3, 0.0, 16.7, 5)
  RETURNING id INTO v_pereira;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Magomed Ankalaev', 'The Mountaineer', 'magomed-ankalaev', 'Light Heavyweight', 19, 1, 1, 0, 191, 188, 'Orthodox', 42.1, 10.5, 47.4, 4)
  RETURNING id INTO v_ankalaev;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Merab Dvalishvili', 'The Machine', 'merab-dvalishvili', 'Bantamweight', 18, 4, 0, 0, 170, 175, 'Orthodox', 11.1, 5.6, 83.3, 11)
  RETURNING id INTO v_dvalishvili;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Umar Nurmagomedov', 'Young Eagle', 'umar-nurmagomedov', 'Bantamweight', 18, 0, 0, 0, 175, 178, 'Orthodox', 22.2, 27.8, 50.0, 18)
  RETURNING id INTO v_nurmagomedov;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Dricus Du Plessis', 'Stillknocks', 'dricus-du-plessis', 'Middleweight', 22, 2, 0, 0, 180, 188, 'Orthodox', 63.6, 9.1, 27.3, 10)
  RETURNING id INTO v_duplessis;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Sean Strickland', 'Tarzan', 'sean-strickland', 'Middleweight', 29, 6, 0, 0, 185, 193, 'Orthodox', 24.1, 6.9, 69.0, 3)
  RETURNING id INTO v_strickland;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Ilia Topuria', 'El Matador', 'ilia-topuria', 'Featherweight', 16, 0, 0, 0, 170, 175, 'Switch', 56.3, 25.0, 18.7, 16)
  RETURNING id INTO v_topuria;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Max Holloway', 'Blessed', 'max-holloway', 'Featherweight', 26, 7, 0, 0, 180, 175, 'Orthodox', 38.5, 3.8, 57.7, 2)
  RETURNING id INTO v_holloway;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Alexandre Pantoja', 'The Cannibal', 'alexandre-pantoja', 'Flyweight', 28, 5, 0, 0, 168, 170, 'Orthodox', 28.6, 32.1, 39.3, 4)
  RETURNING id INTO v_pantoja;

  INSERT INTO fighters (name, nickname, slug, weight_class, record_wins, record_losses, record_draws, record_nc, height_cm, reach_cm, stance, ko_percentage, sub_percentage, dec_percentage, current_win_streak)
  VALUES ('Brandon Royval', 'Raw Dawg', 'brandon-royval', 'Flyweight', 16, 6, 0, 0, 173, 175, 'Orthodox', 37.5, 25.0, 37.5, 5)
  RETURNING id INTO v_royval;


  -- ========================================================================
  -- INSERT EVENTS
  -- ========================================================================

  INSERT INTO events (name, slug, date, location, status)
  VALUES (
    'UFC 314: Makhachev vs. Tsarukyan 2',
    'ufc-314',
    '2026-03-08T23:00:00Z',
    'T-Mobile Arena, Las Vegas, NV',
    'upcoming'
  ) RETURNING id INTO v_ufc314;

  INSERT INTO events (name, slug, date, location, status)
  VALUES (
    'UFC Fight Night: Pereira vs. Ankalaev',
    'ufc-fn-pereira-ankalaev',
    '2026-03-28T22:00:00Z',
    'UFC Apex, Las Vegas, NV',
    'upcoming'
  ) RETURNING id INTO v_fn_mar;

  INSERT INTO events (name, slug, date, location, status)
  VALUES (
    'UFC 315: Dvalishvili vs. Nurmagomedov',
    'ufc-315',
    '2026-04-18T22:00:00Z',
    'Madison Square Garden, New York, NY',
    'upcoming'
  ) RETURNING id INTO v_ufc315;

  INSERT INTO events (name, slug, date, location, status)
  VALUES (
    'UFC Fight Night: Du Plessis vs. Strickland 2',
    'ufc-fn-duplessis-strickland',
    '2026-05-09T12:00:00Z',
    'RAC Arena, Perth, Australia',
    'upcoming'
  ) RETURNING id INTO v_fn_may;


  -- ========================================================================
  -- INSERT FIGHTS — UFC 314
  -- ========================================================================

  -- Main Event: Makhachev vs Tsarukyan (5 rounds, Lightweight title)
  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc314, v_makhachev, v_tsarukyan, 'main', 5, true, 'Lightweight', 5, 'upcoming');

  -- Co-Main: Topuria vs Holloway (5 rounds, Featherweight title)
  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc314, v_topuria, v_holloway, 'main', 4, false, 'Featherweight', 5, 'upcoming');

  -- Main Card: Pantoja vs Royval
  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc314, v_pantoja, v_royval, 'main', 3, false, 'Flyweight', 3, 'upcoming');

  -- Prelim: Du Plessis vs Strickland
  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc314, v_duplessis, v_strickland, 'prelim', 2, false, 'Middleweight', 3, 'upcoming');

  -- Early Prelim: Dvalishvili vs Nurmagomedov preview
  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc314, v_dvalishvili, v_nurmagomedov, 'early-prelim', 1, false, 'Bantamweight', 3, 'upcoming');


  -- ========================================================================
  -- INSERT FIGHTS — UFC FN: Pereira vs Ankalaev
  -- ========================================================================

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_fn_mar, v_pereira, v_ankalaev, 'main', 4, true, 'Light Heavyweight', 5, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_fn_mar, v_pantoja, v_royval, 'main', 3, false, 'Flyweight', 3, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_fn_mar, v_holloway, v_tsarukyan, 'prelim', 2, false, 'Lightweight', 3, 'upcoming');


  -- ========================================================================
  -- INSERT FIGHTS — UFC 315
  -- ========================================================================

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc315, v_dvalishvili, v_nurmagomedov, 'main', 5, true, 'Bantamweight', 5, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc315, v_duplessis, v_pereira, 'main', 4, false, 'Middleweight', 5, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc315, v_topuria, v_tsarukyan, 'main', 3, false, 'Featherweight', 3, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_ufc315, v_makhachev, v_holloway, 'prelim', 2, false, 'Lightweight', 3, 'upcoming');


  -- ========================================================================
  -- INSERT FIGHTS — UFC FN: Du Plessis vs Strickland 2
  -- ========================================================================

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_fn_may, v_duplessis, v_strickland, 'main', 4, true, 'Middleweight', 5, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_fn_may, v_ankalaev, v_pereira, 'main', 3, false, 'Light Heavyweight', 3, 'upcoming');

  INSERT INTO fights (event_id, fighter_a_id, fighter_b_id, card_position, fight_order, is_main_event, weight_class, scheduled_rounds, status)
  VALUES (v_fn_may, v_pantoja, v_nurmagomedov, 'prelim', 2, false, 'Bantamweight', 3, 'upcoming');

END $$;
