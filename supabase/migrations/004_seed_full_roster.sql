-- ============================================================================
-- FightNight OS — Full UFC Ranked Roster Seed
-- ============================================================================
-- Inserts the Champion + Top 15 ranked fighters for all 11 UFC divisions
-- (8 men's + 3 women's) as of February 2026.
--
-- Uses ON CONFLICT (slug) DO UPDATE so existing fighters from 002/003
-- get their stats refreshed while new fighters are added.
--
-- Run this in your Supabase SQL editor AFTER 001, 002, and 003 migrations.
--
-- SOURCE: UFC.com official rankings & athlete profiles (Feb 2026).
-- Stats for lower-ranked fighters are approximate.
-- ============================================================================

INSERT INTO fighters (
  name, nickname, slug, weight_class,
  record_wins, record_losses, record_draws, record_nc,
  height_cm, reach_cm, stance,
  ko_percentage, sub_percentage, dec_percentage,
  current_win_streak
)
VALUES

-- ========================================================================
-- HEAVYWEIGHT (Champion: Tom Aspinall)
-- ========================================================================
('Tom Aspinall', NULL, 'tom-aspinall', 'Heavyweight', 15, 3, 0, 0, 196, 198, 'Orthodox', 80.00, 20.00, 0.00, 5),
('Ciryl Gane', 'Bon Gamin', 'ciryl-gane', 'Heavyweight', 13, 2, 0, 0, 193, 206, 'Orthodox', 46.15, 23.08, 30.77, 0),
('Alexander Volkov', 'Drago', 'alexander-volkov', 'Heavyweight', 38, 10, 0, 0, 201, 203, 'Orthodox', 55.26, 7.89, 36.84, 2),
('Sergei Pavlovich', NULL, 'sergei-pavlovich', 'Heavyweight', 19, 3, 0, 0, 196, 203, 'Orthodox', 78.95, 5.26, 15.79, 0),
('Curtis Blaydes', 'Razor', 'curtis-blaydes', 'Heavyweight', 18, 4, 0, 1, 193, 203, 'Orthodox', 38.89, 5.56, 55.56, 2),
('Waldo Cortes Acosta', NULL, 'waldo-cortes-acosta', 'Heavyweight', 12, 1, 0, 0, 193, 198, 'Orthodox', 58.33, 16.67, 25.00, 4),
('Rizvan Kuniev', NULL, 'rizvan-kuniev', 'Heavyweight', 12, 0, 0, 0, 190, 196, 'Orthodox', 58.33, 16.67, 25.00, 12),
('Serghei Spivac', NULL, 'serghei-spivac', 'Heavyweight', 17, 4, 0, 0, 188, 196, 'Southpaw', 47.06, 23.53, 29.41, 1),
('Jailton Almeida', 'Malhadinho', 'jailton-almeida', 'Heavyweight', 22, 3, 0, 0, 188, 196, 'Orthodox', 22.73, 54.55, 22.73, 3),
('Ante Delija', NULL, 'ante-delija', 'Heavyweight', 22, 6, 0, 0, 196, 196, 'Orthodox', 54.55, 9.09, 36.36, 2),
('Marcin Tybura', NULL, 'marcin-tybura', 'Heavyweight', 25, 8, 0, 0, 188, 193, 'Orthodox', 28.00, 24.00, 48.00, 2),
('Derrick Lewis', 'The Black Beast', 'derrick-lewis', 'Heavyweight', 28, 12, 0, 1, 191, 196, 'Orthodox', 82.14, 0.00, 17.86, 0),
('Tallison Teixeira', NULL, 'tallison-teixeira', 'Heavyweight', 8, 0, 0, 0, 193, 198, 'Orthodox', 75.00, 12.50, 12.50, 8),
('Shamil Gaziev', NULL, 'shamil-gaziev', 'Heavyweight', 12, 1, 0, 0, 190, 198, 'Orthodox', 66.67, 8.33, 25.00, 3),
('Valter Walker', NULL, 'valter-walker', 'Heavyweight', 11, 2, 0, 0, 196, 201, 'Orthodox', 54.55, 18.18, 27.27, 3),
('Mick Parkin', NULL, 'mick-parkin', 'Heavyweight', 9, 1, 0, 0, 196, 198, 'Orthodox', 55.56, 11.11, 33.33, 3),

-- ========================================================================
-- LIGHT HEAVYWEIGHT (Champion: Alex Pereira)
-- ========================================================================
('Alex Pereira', 'Poatan', 'alex-pereira', 'Light Heavyweight', 13, 3, 0, 0, 193, 201, 'Orthodox', 84.62, 0.00, 15.38, 6),
('Magomed Ankalaev', NULL, 'magomed-ankalaev', 'Light Heavyweight', 21, 2, 1, 0, 190, 190, 'Orthodox', 52.38, 0.00, 47.62, 0),
('Jiří Procházka', NULL, 'jiri-prochazka', 'Light Heavyweight', 32, 5, 1, 0, 190, 203, 'Orthodox', 87.50, 9.38, 3.13, 2),
('Carlos Ulberg', 'Black Jag', 'carlos-ulberg', 'Light Heavyweight', 14, 1, 0, 0, 193, 196, 'Orthodox', 57.14, 7.14, 35.71, 9),
('Khalil Rountree Jr.', 'The War Horse', 'khalil-rountree-jr', 'Light Heavyweight', 13, 5, 0, 1, 185, 196, 'Orthodox', 69.23, 0.00, 30.77, 0),
('Jan Błachowicz', 'Prince of Cieszyn', 'jan-blachowicz', 'Light Heavyweight', 29, 10, 0, 1, 188, 196, 'Orthodox', 27.59, 20.69, 51.72, 1),
('Azamat Murzakanov', NULL, 'azamat-murzakanov', 'Light Heavyweight', 14, 1, 0, 0, 183, 188, 'Orthodox', 50.00, 7.14, 42.86, 5),
('Jamahal Hill', 'Sweet Dreams', 'jamahal-hill', 'Light Heavyweight', 12, 3, 0, 1, 196, 198, 'Orthodox', 58.33, 8.33, 33.33, 0),
('Volkan Oezdemir', 'No Time', 'volkan-oezdemir', 'Light Heavyweight', 20, 7, 0, 0, 183, 185, 'Orthodox', 55.00, 5.00, 40.00, 3),
('Bogdan Guskov', NULL, 'bogdan-guskov', 'Light Heavyweight', 16, 3, 0, 0, 191, 190, 'Orthodox', 50.00, 31.25, 18.75, 2),
('Dominick Reyes', 'The Devastator', 'dominick-reyes', 'Light Heavyweight', 13, 4, 0, 0, 193, 196, 'Orthodox', 46.15, 7.69, 46.15, 1),
('Aleksandar Rakić', NULL, 'aleksandar-rakic', 'Light Heavyweight', 14, 4, 0, 0, 196, 196, 'Orthodox', 42.86, 14.29, 42.86, 1),
('Johnny Walker', NULL, 'johnny-walker', 'Light Heavyweight', 21, 9, 0, 0, 198, 203, 'Orthodox', 66.67, 14.29, 19.05, 1),
('Nikita Krylov', 'The Miner', 'nikita-krylov', 'Light Heavyweight', 30, 10, 0, 0, 185, 191, 'Orthodox', 30.00, 50.00, 20.00, 0),
('Dustin Jacoby', 'The Hanyak', 'dustin-jacoby', 'Light Heavyweight', 18, 7, 1, 0, 191, 196, 'Orthodox', 44.44, 5.56, 50.00, 1),
('Zhang Mingyang', NULL, 'zhang-mingyang', 'Light Heavyweight', 18, 3, 0, 0, 196, 203, 'Orthodox', 72.22, 5.56, 22.22, 5),

-- ========================================================================
-- MIDDLEWEIGHT (Champion: Khamzat Chimaev)
-- ========================================================================
('Khamzat Chimaev', 'Borz', 'khamzat-chimaev', 'Middleweight', 15, 0, 0, 0, 188, 190, 'Orthodox', 40.00, 40.00, 20.00, 15),
('Dricus Du Plessis', 'Stillknocks', 'dricus-du-plessis', 'Middleweight', 23, 3, 0, 0, 185, 193, 'Orthodox', 39.13, 47.83, 13.04, 0),
('Nassourdine Imavov', 'The Sniper', 'nassourdine-imavov', 'Middleweight', 17, 4, 0, 0, 190, 190, 'Orthodox', 41.18, 23.53, 35.29, 5),
('Sean Strickland', 'Tarzan', 'sean-strickland', 'Middleweight', 29, 7, 0, 0, 185, 193, 'Orthodox', 37.93, 13.79, 48.28, 2),
('Anthony Hernandez', 'Fluffy', 'anthony-hernandez', 'Middleweight', 13, 2, 0, 1, 188, 193, 'Orthodox', 15.38, 53.85, 30.77, 5),
('Brendan Allen', NULL, 'brendan-allen', 'Middleweight', 24, 6, 0, 0, 191, 193, 'Orthodox', 25.00, 50.00, 25.00, 4),
('Israel Adesanya', 'The Last Stylebender', 'israel-adesanya', 'Middleweight', 24, 5, 0, 0, 193, 203, 'Switch', 66.67, 0.00, 33.33, 1),
('Caio Borralho', NULL, 'caio-borralho', 'Middleweight', 17, 1, 0, 0, 185, 190, 'Southpaw', 35.29, 23.53, 41.18, 8),
('Reinier de Ridder', 'The Dutch Knight', 'reinier-de-ridder', 'Middleweight', 18, 3, 0, 0, 196, 193, 'Orthodox', 11.11, 72.22, 16.67, 2),
('Robert Whittaker', 'The Reaper', 'robert-whittaker', 'Middleweight', 25, 7, 0, 0, 183, 185, 'Orthodox', 36.00, 16.00, 48.00, 0),
('Jared Cannonier', 'The Killa Gorilla', 'jared-cannonier', 'Middleweight', 17, 7, 0, 0, 180, 196, 'Switch', 52.94, 5.88, 41.18, 1),
('Roman Dolidze', NULL, 'roman-dolidze', 'Middleweight', 14, 4, 0, 0, 185, 191, 'Orthodox', 35.71, 42.86, 21.43, 1),
('Paulo Costa', 'Borrachinha', 'paulo-costa', 'Middleweight', 14, 4, 0, 0, 185, 183, 'Orthodox', 71.43, 0.00, 28.57, 0),
('Gregory Rodrigues', 'Robocop', 'gregory-rodrigues', 'Middleweight', 16, 6, 0, 0, 185, 191, 'Orthodox', 50.00, 18.75, 31.25, 2),
('Joe Pyfer', 'Bodybagz', 'joe-pyfer', 'Middleweight', 13, 4, 0, 0, 188, 191, 'Orthodox', 61.54, 7.69, 30.77, 0),
('Brunno Ferreira', NULL, 'brunno-ferreira', 'Middleweight', 14, 2, 0, 0, 185, 185, 'Orthodox', 64.29, 14.29, 21.43, 3),

-- ========================================================================
-- WELTERWEIGHT (Champion: Islam Makhachev)
-- ========================================================================
('Islam Makhachev', NULL, 'islam-makhachev', 'Welterweight', 28, 1, 0, 0, 178, 179, 'Orthodox', 17.86, 46.43, 35.71, 16),
('Jack Della Maddalena', NULL, 'jack-della-maddalena', 'Welterweight', 18, 3, 0, 0, 180, 185, 'Orthodox', 66.67, 11.11, 22.22, 0),
('Ian Machado Garry', 'The Future', 'ian-machado-garry', 'Welterweight', 17, 1, 0, 0, 190, 189, 'Orthodox', 41.18, 5.88, 52.94, 2),
('Michael Morales', NULL, 'michael-morales', 'Welterweight', 19, 0, 0, 0, 183, 201, 'Orthodox', 73.68, 5.26, 21.05, 19),
('Belal Muhammad', 'Remember The Name', 'belal-muhammad', 'Welterweight', 24, 5, 0, 1, 180, 183, 'Switch', 20.83, 4.17, 75.00, 2),
('Carlos Prates', NULL, 'carlos-prates', 'Welterweight', 22, 6, 0, 0, 185, 188, 'Southpaw', 72.73, 13.64, 13.64, 0),
('Sean Brady', NULL, 'sean-brady', 'Welterweight', 16, 1, 0, 0, 180, 180, 'Orthodox', 12.50, 43.75, 43.75, 4),
('Kamaru Usman', 'The Nigerian Nightmare', 'kamaru-usman', 'Welterweight', 20, 4, 0, 0, 183, 193, 'Orthodox', 45.00, 5.00, 50.00, 0),
('Leon Edwards', 'Rocky', 'leon-edwards', 'Welterweight', 22, 4, 0, 1, 183, 188, 'Orthodox', 31.82, 13.64, 54.55, 0),
('Joaquin Buckley', 'New Mansa', 'joaquin-buckley', 'Welterweight', 20, 6, 0, 0, 180, 183, 'Orthodox', 60.00, 10.00, 30.00, 4),
('Gabriel Bonfim', NULL, 'gabriel-bonfim', 'Welterweight', 18, 2, 0, 0, 183, 185, 'Orthodox', 55.56, 27.78, 16.67, 3),
('Gilbert Burns', 'Durinho', 'gilbert-burns', 'Welterweight', 22, 7, 0, 0, 178, 180, 'Orthodox', 31.82, 36.36, 31.82, 1),
('Geoff Neal', 'Handz of Steel', 'geoff-neal', 'Welterweight', 16, 5, 0, 0, 180, 185, 'Orthodox', 62.50, 0.00, 37.50, 1),
('Daniel Rodriguez', NULL, 'daniel-rodriguez', 'Welterweight', 18, 5, 0, 0, 183, 188, 'Orthodox', 50.00, 11.11, 38.89, 1),
('Michael Page', 'Venom', 'michael-page', 'Welterweight', 22, 3, 0, 0, 191, 196, 'Orthodox', 63.64, 9.09, 27.27, 1),
('Colby Covington', 'Chaos', 'colby-covington', 'Welterweight', 17, 4, 0, 0, 180, 183, 'Orthodox', 5.88, 5.88, 88.24, 0),

-- ========================================================================
-- LIGHTWEIGHT (Champion: Ilia Topuria)
-- ========================================================================
('Ilia Topuria', 'El Matador', 'ilia-topuria', 'Lightweight', 17, 0, 0, 0, 170, 175, 'Switch', 41.18, 47.06, 11.76, 17),
('Justin Gaethje', 'The Highlight', 'justin-gaethje', 'Lightweight', 27, 5, 0, 0, 180, 178, 'Orthodox', 74.07, 3.70, 22.22, 4),
('Arman Tsarukyan', 'Ahalkalakets', 'arman-tsarukyan', 'Lightweight', 23, 3, 0, 0, 170, 184, 'Orthodox', 39.13, 26.09, 34.78, 5),
('Charles Oliveira', 'Do Bronxs', 'charles-oliveira', 'Lightweight', 36, 11, 0, 0, 178, 188, 'Orthodox', 27.78, 61.11, 11.11, 2),
('Max Holloway', 'Blessed', 'max-holloway', 'Lightweight', 27, 8, 0, 0, 180, 175, 'Orthodox', 44.44, 7.41, 48.15, 1),
('Benoît Saint Denis', 'God of War', 'benoit-saint-denis', 'Lightweight', 14, 2, 0, 1, 185, 188, 'Orthodox', 57.14, 35.71, 7.14, 2),
('Paddy Pimblett', 'The Baddy', 'paddy-pimblett', 'Lightweight', 22, 3, 0, 0, 178, 180, 'Orthodox', 27.27, 36.36, 36.36, 5),
('Mateusz Gamrot', NULL, 'mateusz-gamrot', 'Lightweight', 24, 3, 0, 0, 178, 178, 'Orthodox', 20.83, 25.00, 54.17, 0),
('Dan Hooker', 'The Hangman', 'dan-hooker', 'Lightweight', 24, 13, 0, 0, 185, 193, 'Orthodox', 41.67, 25.00, 33.33, 3),
('Mauricio Ruffy', NULL, 'mauricio-ruffy', 'Lightweight', 12, 1, 0, 0, 180, 188, 'Orthodox', 66.67, 16.67, 16.67, 5),
('Renato Moicano', 'Money', 'renato-moicano', 'Lightweight', 21, 5, 1, 0, 180, 185, 'Orthodox', 23.81, 42.86, 33.33, 1),
('Rafael Fiziev', 'Ataman', 'rafael-fiziev', 'Lightweight', 14, 3, 0, 0, 175, 178, 'Southpaw', 64.29, 0.00, 35.71, 1),
('Beneil Dariush', NULL, 'beneil-dariush', 'Lightweight', 22, 6, 1, 0, 175, 183, 'Orthodox', 22.73, 40.91, 36.36, 0),
('Michael Chandler', 'Iron', 'michael-chandler', 'Lightweight', 23, 8, 0, 0, 175, 185, 'Orthodox', 47.83, 17.39, 34.78, 0),
('Manuel Torres', NULL, 'manuel-torres', 'Lightweight', 16, 2, 0, 0, 180, 185, 'Orthodox', 62.50, 18.75, 18.75, 5),
('Farès Ziam', NULL, 'fares-ziam', 'Lightweight', 15, 4, 0, 0, 180, 190, 'Orthodox', 26.67, 13.33, 60.00, 3),

-- ========================================================================
-- FEATHERWEIGHT (Champion: Alexander Volkanovski)
-- ========================================================================
('Alexander Volkanovski', 'The Great', 'alexander-volkanovski', 'Featherweight', 28, 4, 0, 0, 168, 182, 'Orthodox', 46.43, 10.71, 42.86, 2),
('Movsar Evloev', NULL, 'movsar-evloev', 'Featherweight', 19, 0, 0, 0, 170, 184, 'Orthodox', 15.79, 21.05, 63.16, 19),
('Diego Lopes', NULL, 'diego-lopes', 'Featherweight', 27, 8, 0, 0, 180, 184, 'Orthodox', 40.74, 44.44, 14.81, 0),
('Lerone Murphy', NULL, 'lerone-murphy', 'Featherweight', 17, 0, 1, 0, 175, 185, 'Orthodox', 35.29, 17.65, 47.06, 9),
('Yair Rodriguez', 'El Pantera', 'yair-rodriguez', 'Featherweight', 16, 4, 0, 1, 180, 183, 'Southpaw', 43.75, 12.50, 43.75, 0),
('Aljamain Sterling', 'Funk Master', 'aljamain-sterling', 'Featherweight', 24, 5, 0, 0, 170, 180, 'Orthodox', 12.50, 29.17, 58.33, 0),
('Jean Silva', NULL, 'jean-silva', 'Featherweight', 14, 2, 0, 2, 175, 183, 'Orthodox', 57.14, 21.43, 21.43, 3),
('Arnold Allen', 'Almighty', 'arnold-allen', 'Featherweight', 20, 3, 0, 0, 175, 180, 'Orthodox', 30.00, 30.00, 40.00, 0),
('Youssef Zalal', 'The Moroccan Devil', 'youssef-zalal', 'Featherweight', 16, 5, 0, 0, 175, 180, 'Orthodox', 25.00, 25.00, 50.00, 4),
('Steve Garcia', NULL, 'steve-garcia', 'Featherweight', 17, 5, 0, 0, 175, 180, 'Orthodox', 47.06, 23.53, 29.41, 2),
('Brian Ortega', 'T-City', 'brian-ortega', 'Featherweight', 16, 4, 0, 1, 175, 178, 'Orthodox', 6.25, 50.00, 43.75, 0),
('Josh Emmett', NULL, 'josh-emmett', 'Featherweight', 18, 5, 0, 0, 170, 170, 'Orthodox', 55.56, 0.00, 44.44, 0),
('Patricio Pitbull', 'Pitbull', 'patricio-pitbull', 'Featherweight', 35, 8, 0, 0, 170, 170, 'Orthodox', 42.86, 20.00, 37.14, 2),
('Kevin Vallejos', NULL, 'kevin-vallejos', 'Featherweight', 12, 2, 0, 0, 173, 178, 'Orthodox', 58.33, 16.67, 25.00, 4),
('Dan Ige', NULL, 'dan-ige', 'Featherweight', 18, 8, 0, 0, 170, 178, 'Southpaw', 38.89, 11.11, 50.00, 2),
('David Onama', 'Semper Fi', 'david-onama', 'Featherweight', 14, 3, 0, 0, 180, 183, 'Orthodox', 57.14, 14.29, 28.57, 1),

-- ========================================================================
-- BANTAMWEIGHT (Champion: Petr Yan)
-- ========================================================================
('Petr Yan', 'No Mercy', 'petr-yan', 'Bantamweight', 20, 5, 0, 0, 171, 170, 'Orthodox', 35.00, 5.00, 60.00, 4),
('Merab Dvalishvili', 'The Machine', 'merab-dvalishvili', 'Bantamweight', 21, 5, 0, 0, 168, 173, 'Orthodox', 14.29, 9.52, 76.19, 0),
('Umar Nurmagomedov', NULL, 'umar-nurmagomedov', 'Bantamweight', 20, 1, 0, 0, 173, 175, 'Orthodox', 10.00, 35.00, 55.00, 2),
('Sean O''Malley', 'Suga', 'sean-omalley', 'Bantamweight', 19, 3, 0, 1, 180, 183, 'Southpaw', 63.16, 5.26, 31.58, 1),
('Cory Sandhagen', 'The Sandman', 'cory-sandhagen', 'Bantamweight', 18, 6, 0, 0, 180, 178, 'Orthodox', 44.44, 16.67, 38.89, 0),
('Song Yadong', 'Kung Fu Monkey', 'song-yadong', 'Bantamweight', 22, 8, 1, 0, 175, 178, 'Orthodox', 45.45, 4.55, 50.00, 0),
('Aiemann Zahabi', NULL, 'aiemann-zahabi', 'Bantamweight', 11, 1, 0, 0, 173, 175, 'Orthodox', 27.27, 9.09, 63.64, 4),
('Deiveson Figueiredo', 'Deus da Guerra', 'deiveson-figueiredo', 'Bantamweight', 24, 4, 1, 0, 165, 168, 'Orthodox', 50.00, 20.83, 29.17, 0),
('Mario Bautista', NULL, 'mario-bautista', 'Bantamweight', 14, 3, 0, 0, 170, 175, 'Orthodox', 35.71, 35.71, 28.57, 0),
('Marlon Vera', 'Chito', 'marlon-vera', 'Bantamweight', 23, 10, 1, 0, 173, 180, 'Orthodox', 52.17, 21.74, 26.09, 0),
('David Martinez', NULL, 'david-martinez', 'Bantamweight', 11, 2, 0, 0, 170, 173, 'Orthodox', 45.45, 27.27, 27.27, 3),
('Payton Talbott', NULL, 'payton-talbott', 'Bantamweight', 10, 0, 0, 0, 175, 178, 'Orthodox', 60.00, 10.00, 30.00, 10),
('Vinicius Oliveira', NULL, 'vinicius-oliveira', 'Bantamweight', 15, 2, 0, 0, 173, 178, 'Orthodox', 40.00, 26.67, 33.33, 3),
('Rob Font', NULL, 'rob-font', 'Bantamweight', 20, 8, 0, 0, 175, 175, 'Orthodox', 45.00, 10.00, 45.00, 1),
('Kyler Phillips', 'The Matrix', 'kyler-phillips', 'Bantamweight', 13, 3, 0, 0, 170, 180, 'Orthodox', 30.77, 23.08, 46.15, 1),
('Montel Jackson', NULL, 'montel-jackson', 'Bantamweight', 15, 3, 0, 0, 175, 178, 'Orthodox', 40.00, 26.67, 33.33, 3),

-- ========================================================================
-- FLYWEIGHT (Champion: Joshua Van)
-- ========================================================================
('Joshua Van', 'The Fearless', 'joshua-van', 'Flyweight', 16, 2, 0, 0, 165, 165, 'Orthodox', 50.00, 12.50, 37.50, 6),
('Alexandre Pantoja', 'The Cannibal', 'alexandre-pantoja', 'Flyweight', 30, 6, 0, 0, 165, 170, 'Orthodox', 26.67, 40.00, 33.33, 0),
('Manel Kape', 'StarBoy', 'manel-kape', 'Flyweight', 22, 7, 0, 0, 165, 173, 'Orthodox', 63.64, 22.73, 13.64, 4),
('Tatsuro Taira', 'The Best', 'tatsuro-taira', 'Flyweight', 18, 1, 0, 0, 170, 178, 'Orthodox', 33.33, 44.44, 22.22, 3),
('Brandon Royval', 'Raw Dawg', 'brandon-royval', 'Flyweight', 17, 9, 0, 0, 175, 173, 'Orthodox', 23.53, 52.94, 23.53, 0),
('Kyoji Horiguchi', NULL, 'kyoji-horiguchi', 'Flyweight', 32, 5, 0, 0, 165, 165, 'Orthodox', 46.88, 15.63, 37.50, 2),
('Brandon Moreno', 'The Assassin Baby', 'brandon-moreno', 'Flyweight', 21, 8, 2, 0, 170, 175, 'Orthodox', 33.33, 33.33, 33.33, 0),
('Amir Albazi', 'The Prince', 'amir-albazi', 'Flyweight', 17, 2, 0, 0, 170, 170, 'Orthodox', 29.41, 29.41, 41.18, 2),
('Asu Almabayev', NULL, 'asu-almabayev', 'Flyweight', 21, 2, 0, 0, 168, 168, 'Orthodox', 38.10, 28.57, 33.33, 5),
('Tim Elliott', NULL, 'tim-elliott', 'Flyweight', 20, 13, 1, 0, 170, 173, 'Orthodox', 15.00, 30.00, 55.00, 2),
('Alex Perez', NULL, 'alex-perez', 'Flyweight', 25, 8, 0, 0, 168, 170, 'Orthodox', 40.00, 20.00, 40.00, 1),
('Steve Erceg', NULL, 'steve-erceg', 'Flyweight', 12, 2, 0, 0, 170, 175, 'Orthodox', 33.33, 33.33, 33.33, 0),
('Tagir Ulanbekov', NULL, 'tagir-ulanbekov', 'Flyweight', 16, 2, 0, 0, 170, 173, 'Orthodox', 12.50, 31.25, 56.25, 2),
('Charles Johnson', NULL, 'charles-johnson', 'Flyweight', 16, 5, 0, 0, 170, 173, 'Orthodox', 50.00, 18.75, 31.25, 2),
('Bruno Silva', NULL, 'bruno-silva', 'Flyweight', 23, 11, 0, 0, 170, 173, 'Orthodox', 52.17, 17.39, 30.43, 2),
('Lone''er Kavanagh', NULL, 'loneer-kavanagh', 'Flyweight', 8, 0, 0, 0, 170, 175, 'Orthodox', 50.00, 25.00, 25.00, 8),

-- ========================================================================
-- WOMEN'S STRAWWEIGHT (Champion: Mackenzie Dern)
-- ========================================================================
('Mackenzie Dern', NULL, 'mackenzie-dern', 'Women''s Strawweight', 16, 5, 0, 0, 163, 160, 'Orthodox', 0.00, 50.00, 50.00, 3),
('Zhang Weili', 'Magnum', 'zhang-weili', 'Women''s Strawweight', 26, 4, 0, 0, 163, 160, 'Orthodox', 42.31, 30.77, 26.92, 3),
('Tatiana Suarez', NULL, 'tatiana-suarez', 'Women''s Strawweight', 11, 1, 0, 0, 163, 160, 'Orthodox', 27.27, 18.18, 54.55, 2),
('Virna Jandiroba', NULL, 'virna-jandiroba', 'Women''s Strawweight', 21, 4, 0, 0, 160, 163, 'Orthodox', 9.52, 66.67, 23.81, 0),
('Yan Xiaonan', 'Fury', 'yan-xiaonan', 'Women''s Strawweight', 18, 5, 0, 0, 163, 165, 'Orthodox', 22.22, 0.00, 77.78, 0),
('Amanda Lemos', NULL, 'amanda-lemos', 'Women''s Strawweight', 15, 4, 1, 0, 170, 170, 'Southpaw', 46.67, 26.67, 26.67, 1),
('Loopy Godinez', NULL, 'loopy-godinez', 'Women''s Strawweight', 12, 4, 0, 0, 163, 165, 'Orthodox', 16.67, 33.33, 50.00, 2),
('Tabatha Ricci', NULL, 'tabatha-ricci', 'Women''s Strawweight', 12, 3, 0, 0, 160, 163, 'Orthodox', 16.67, 25.00, 58.33, 3),
('Gillian Robertson', 'The Savage', 'gillian-robertson', 'Women''s Strawweight', 14, 8, 0, 0, 168, 163, 'Orthodox', 0.00, 71.43, 28.57, 2),
('Jéssica Andrade', 'Bate Estaca', 'jessica-andrade', 'Women''s Strawweight', 26, 12, 0, 0, 157, 160, 'Orthodox', 34.62, 15.38, 50.00, 0),
('Amanda Ribas', NULL, 'amanda-ribas', 'Women''s Strawweight', 13, 5, 0, 0, 165, 163, 'Orthodox', 23.08, 30.77, 46.15, 1),
('Fatima Kline', NULL, 'fatima-kline', 'Women''s Strawweight', 7, 2, 0, 0, 163, 165, 'Orthodox', 42.86, 28.57, 28.57, 2),
('Denise Gomes', NULL, 'denise-gomes', 'Women''s Strawweight', 9, 3, 0, 0, 163, 165, 'Orthodox', 33.33, 44.44, 22.22, 2),
('Alexia Thainara', NULL, 'alexia-thainara', 'Women''s Strawweight', 8, 2, 0, 0, 163, 163, 'Orthodox', 50.00, 25.00, 25.00, 3),
('Angela Hill', 'Overkill', 'angela-hill', 'Women''s Strawweight', 17, 13, 0, 0, 163, 165, 'Orthodox', 17.65, 11.76, 70.59, 0),
('Mizuki', NULL, 'mizuki', 'Women''s Strawweight', 17, 6, 0, 0, 160, 158, 'Orthodox', 35.29, 17.65, 47.06, 2),

-- ========================================================================
-- WOMEN'S FLYWEIGHT (Champion: Valentina Shevchenko)
-- ========================================================================
('Valentina Shevchenko', 'Bullet', 'valentina-shevchenko', 'Women''s Flyweight', 26, 4, 1, 0, 165, 170, 'Orthodox', 30.77, 26.92, 42.31, 3),
('Natalia Silva', NULL, 'natalia-silva', 'Women''s Flyweight', 20, 5, 1, 0, 163, 165, 'Orthodox', 25.00, 35.00, 40.00, 0),
('Manon Fiorot', 'The Beast', 'manon-fiorot', 'Women''s Flyweight', 13, 2, 0, 0, 170, 165, 'Orthodox', 43.75, 25.00, 31.25, 1),
('Alexa Grasso', NULL, 'alexa-grasso', 'Women''s Flyweight', 16, 5, 1, 0, 165, 168, 'Orthodox', 25.00, 12.50, 62.50, 2),
('Erin Blanchfield', 'Cold Blooded', 'erin-blanchfield', 'Women''s Flyweight', 14, 2, 0, 0, 163, 168, 'Orthodox', 14.29, 35.71, 50.00, 3),
('Maycee Barber', 'The Future', 'maycee-barber', 'Women''s Flyweight', 14, 3, 0, 0, 168, 170, 'Orthodox', 42.86, 7.14, 50.00, 2),
('Jasmine Jasudavicius', NULL, 'jasmine-jasudavicius', 'Women''s Flyweight', 13, 4, 0, 0, 173, 173, 'Orthodox', 7.69, 23.08, 69.23, 3),
('Rose Namajunas', 'Thug', 'rose-namajunas', 'Women''s Flyweight', 15, 8, 0, 0, 165, 165, 'Orthodox', 13.33, 40.00, 46.67, 1),
('Tracy Cortez', NULL, 'tracy-cortez', 'Women''s Flyweight', 12, 3, 0, 0, 163, 163, 'Orthodox', 16.67, 16.67, 66.67, 0),
('Karine Silva', NULL, 'karine-silva', 'Women''s Flyweight', 18, 5, 0, 0, 163, 163, 'Orthodox', 16.67, 44.44, 38.89, 3),
('Miranda Maverick', NULL, 'miranda-maverick', 'Women''s Flyweight', 14, 5, 0, 0, 168, 173, 'Orthodox', 28.57, 21.43, 50.00, 1),
('Wang Cong', NULL, 'wang-cong', 'Women''s Flyweight', 7, 0, 0, 0, 163, 163, 'Orthodox', 57.14, 14.29, 28.57, 7),
('Casey O''Neill', 'King', 'casey-oneill', 'Women''s Flyweight', 10, 2, 0, 0, 170, 175, 'Orthodox', 20.00, 30.00, 50.00, 1),
('Eduarda Moura', NULL, 'eduarda-moura', 'Women''s Flyweight', 7, 1, 0, 0, 163, 163, 'Orthodox', 42.86, 28.57, 28.57, 3),
('JJ Aldrich', NULL, 'jj-aldrich', 'Women''s Flyweight', 12, 5, 0, 0, 163, 163, 'Orthodox', 16.67, 16.67, 66.67, 2),
('Gabriella Fernandes', NULL, 'gabriella-fernandes', 'Women''s Flyweight', 8, 2, 0, 0, 163, 165, 'Orthodox', 37.50, 25.00, 37.50, 2),

-- ========================================================================
-- WOMEN'S BANTAMWEIGHT (Champion: Kayla Harrison)
-- ========================================================================
('Kayla Harrison', NULL, 'kayla-harrison', 'Women''s Bantamweight', 19, 1, 0, 0, 173, 168, 'Orthodox', 31.58, 42.11, 26.32, 4),
('Julianna Peña', 'The Venezuelan Vixen', 'julianna-pena', 'Women''s Bantamweight', 15, 6, 0, 0, 168, 170, 'Orthodox', 20.00, 26.67, 53.33, 0),
('Raquel Pennington', 'Rocky', 'raquel-pennington', 'Women''s Bantamweight', 16, 9, 0, 0, 168, 170, 'Orthodox', 18.75, 12.50, 68.75, 0),
('Norma Dumont', NULL, 'norma-dumont', 'Women''s Bantamweight', 12, 2, 0, 0, 175, 178, 'Orthodox', 41.67, 0.00, 58.33, 3),
('Ketlen Vieira', NULL, 'ketlen-vieira', 'Women''s Bantamweight', 14, 3, 0, 0, 173, 175, 'Orthodox', 14.29, 21.43, 64.29, 1),
('Yana Santos', 'Foxy', 'yana-santos', 'Women''s Bantamweight', 15, 7, 0, 0, 173, 175, 'Orthodox', 46.67, 6.67, 46.67, 1),
('Irene Aldana', NULL, 'irene-aldana', 'Women''s Bantamweight', 14, 8, 0, 0, 175, 180, 'Orthodox', 42.86, 21.43, 35.71, 0),
('Ailin Perez', NULL, 'ailin-perez', 'Women''s Bantamweight', 12, 2, 0, 0, 165, 170, 'Orthodox', 33.33, 25.00, 41.67, 3),
('Macy Chiasson', NULL, 'macy-chiasson', 'Women''s Bantamweight', 10, 4, 0, 0, 180, 183, 'Orthodox', 50.00, 30.00, 20.00, 0),
('Karol Rosa', NULL, 'karol-rosa', 'Women''s Bantamweight', 18, 6, 0, 0, 160, 165, 'Orthodox', 16.67, 16.67, 66.67, 2),
('Jacqueline Cavalcanti', NULL, 'jacqueline-cavalcanti', 'Women''s Bantamweight', 8, 1, 0, 0, 170, 173, 'Orthodox', 37.50, 25.00, 37.50, 3),
('Mayra Bueno Silva', 'Sheetara', 'mayra-bueno-silva', 'Women''s Bantamweight', 14, 5, 1, 0, 168, 168, 'Orthodox', 21.43, 50.00, 28.57, 0),
('Nora Cornolle', NULL, 'nora-cornolle', 'Women''s Bantamweight', 7, 1, 0, 0, 170, 175, 'Orthodox', 42.86, 28.57, 28.57, 3),
('Miesha Tate', 'Cupcake', 'miesha-tate', 'Women''s Bantamweight', 20, 10, 0, 0, 168, 170, 'Orthodox', 20.00, 30.00, 50.00, 1),
('Joselyne Edwards', NULL, 'joselyne-edwards', 'Women''s Bantamweight', 14, 6, 0, 0, 175, 180, 'Orthodox', 28.57, 7.14, 64.29, 1),
('Luana Santos', NULL, 'luana-santos', 'Women''s Bantamweight', 11, 3, 0, 0, 170, 173, 'Orthodox', 45.45, 27.27, 27.27, 2)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  nickname = EXCLUDED.nickname,
  weight_class = EXCLUDED.weight_class,
  record_wins = EXCLUDED.record_wins,
  record_losses = EXCLUDED.record_losses,
  record_draws = EXCLUDED.record_draws,
  record_nc = EXCLUDED.record_nc,
  height_cm = EXCLUDED.height_cm,
  reach_cm = EXCLUDED.reach_cm,
  stance = EXCLUDED.stance,
  ko_percentage = EXCLUDED.ko_percentage,
  sub_percentage = EXCLUDED.sub_percentage,
  dec_percentage = EXCLUDED.dec_percentage,
  current_win_streak = EXCLUDED.current_win_streak,
  updated_at = now();
