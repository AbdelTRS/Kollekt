-- Suppression des anciennes extensions XY pour éviter les doublons
DELETE FROM extensions WHERE series_id = (SELECT id FROM series WHERE code = 'XY');

-- Ajout de toutes les extensions de la série XY dans l'ordre chronologique
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- 2016
('XY - Évolutions', 'XY12', '2016-11-02', (SELECT id FROM series WHERE code = 'XY')),
('XY - Offensive Vapeur', 'XY11', '2016-08-03', (SELECT id FROM series WHERE code = 'XY')),
('XY - Impact des Destins', 'XY10', '2016-05-04', (SELECT id FROM series WHERE code = 'XY')),
('XY - Générations', 'GEN', '2016-02-22', (SELECT id FROM series WHERE code = 'XY')),
('XY - Poings Furieux', 'XY9', '2016-02-03', (SELECT id FROM series WHERE code = 'XY')),

-- 2015
('XY - Impulsion TURBO', 'XY8', '2015-11-04', (SELECT id FROM series WHERE code = 'XY')),
('XY - Origines Antiques', 'XY7', '2015-08-19', (SELECT id FROM series WHERE code = 'XY')),
('XY - Ciel Rugissant', 'XY6', '2015-05-06', (SELECT id FROM series WHERE code = 'XY')),
('XY - Primo Choc', 'XY5', '2015-02-04', (SELECT id FROM series WHERE code = 'XY')),

-- 2014
('XY - Vigueur Spectrale', 'XY4', '2014-11-05', (SELECT id FROM series WHERE code = 'XY')),
('XY - Poings Furieux', 'XY3', '2014-08-13', (SELECT id FROM series WHERE code = 'XY')),
('XY - Étincelles', 'XY2', '2014-05-07', (SELECT id FROM series WHERE code = 'XY')),
('XY', 'XY1', '2014-02-05', (SELECT id FROM series WHERE code = 'XY')),

-- 2013
('XY - Kalos', 'XYK', '2013-10-12', (SELECT id FROM series WHERE code = 'XY')),

-- Mini-sets et Promos
('XY - Double Danger', 'DC', '2016-08-03', (SELECT id FROM series WHERE code = 'XY')),
('XY - Coffret des Dragons', 'DRV', '2015-10-30', (SELECT id FROM series WHERE code = 'XY')),
('XY - Trainer Kit Pikachu Libre & Suicune', 'TK-PLS', '2016-01-29', (SELECT id FROM series WHERE code = 'XY')),
('XY - Trainer Kit Latias & Latios', 'TK-LL', '2015-01-07', (SELECT id FROM series WHERE code = 'XY')),
('XY - Trainer Kit Sylveon & Noivern', 'TK-SN', '2014-11-05', (SELECT id FROM series WHERE code = 'XY')),
('XY - Cartes Promo', 'XYP', '2013-10-12', (SELECT id FROM series WHERE code = 'XY')); 