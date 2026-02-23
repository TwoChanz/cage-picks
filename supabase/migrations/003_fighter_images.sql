-- ============================================================================
-- FightNight OS — Fighter Image URLs
-- ============================================================================
-- Updates all 12 seeded fighters with official UFC headshot images.
-- Run this in your Supabase SQL editor AFTER 002_seed_events.sql.
-- ============================================================================

UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-01/7/MAKHACHEV_ISLAM_BELT_01-18.png?itok=mDAVUMGx' WHERE slug = 'islam-makhachev';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-11/TSARUKYAN_ARMAN_11-22.png?itok=y-maWQse' WHERE slug = 'arman-tsarukyan';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-03/PEREIRA_ALEX_BELT_03-08.png?itok=AQypgXAy' WHERE slug = 'alex-pereira';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-03/ANKALAEV_MAGOMED_03-08.png?itok=rWJFBmBA' WHERE slug = 'magomed-ankalaev';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2024-09/DVALISHVILI_MERAB_CG_09-14.png?itok=RchAgSnI' WHERE slug = 'merab-dvalishvili';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2026-01/NURMAGOMEDOV_UMAR_01-24.png?itok=uvOyVYpD' WHERE slug = 'umar-nurmagomedov';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2024-01/DU_PLESSIS_DRICUS_01-20.png?itok=2XrfDXg7' WHERE slug = 'dricus-du-plessis';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/image/2026-02/STRICKLAND_SEAN_02-08.png?itok=6VSaTYHr' WHERE slug = 'sean-strickland';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-06/TOPURIA_ILIA_BELT_10-26.png?itok=zWSCV7gp' WHERE slug = 'ilia-topuria';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-07/HOLLOWAY_MAX_BMF_07-19.png?itok=LmAQ-b15' WHERE slug = 'max-holloway';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2023-07/PANTOJA_ALEXANDRE_07-08.png?itok=q3JLsy5P' WHERE slug = 'alexandre-pantoja';
UPDATE fighters SET image_url = 'https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/2025-12/ROYVAL_BRANDON_12-13.png?itok=rtyRVRP-' WHERE slug = 'brandon-royval';
