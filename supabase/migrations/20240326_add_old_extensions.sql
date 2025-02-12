-- Ajout des extensions pour la série XY
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- XY (2013-2016)
('XY - Impact des Destins', 'XY10', '2016-05-04', (SELECT id FROM series WHERE code = 'XY')),
('XY - Générations', 'GEN', '2016-02-22', (SELECT id FROM series WHERE code = 'XY')),
('XY - Poings Furieux', 'XY9', '2016-02-03', (SELECT id FROM series WHERE code = 'XY')),
('XY - Impulsion TURBO', 'XY8', '2015-11-04', (SELECT id FROM series WHERE code = 'XY')),
('XY - Origines Antiques', 'XY7', '2015-08-19', (SELECT id FROM series WHERE code = 'XY')),
('XY - Ciel Rugissant', 'XY6', '2015-05-06', (SELECT id FROM series WHERE code = 'XY')),
('XY - Primo Choc', 'XY5', '2015-02-04', (SELECT id FROM series WHERE code = 'XY')),
('XY - Phantom Forces', 'XY4', '2014-11-05', (SELECT id FROM series WHERE code = 'XY')),
('XY - Poings Furieux', 'XY3', '2014-08-13', (SELECT id FROM series WHERE code = 'XY')),
('XY - Étincelles', 'XY2', '2014-05-07', (SELECT id FROM series WHERE code = 'XY')),
('XY', 'XY1', '2014-02-05', (SELECT id FROM series WHERE code = 'XY')),
('XY - Kalos', 'XYK', '2013-10-12', (SELECT id FROM series WHERE code = 'XY'));

-- Ajout des extensions pour la série Noir & Blanc
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- Noir & Blanc (2011-2013)
('Noir & Blanc - Glaciation Plasma', 'NB9', '2013-05-08', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Explosion Plasma', 'NB8', '2013-02-06', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Frontières Franchies', 'NB7', '2012-11-07', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Dragons Exaltés', 'NB6', '2012-08-15', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Explorateurs Obscurs', 'NB5', '2012-05-09', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Destinées Futures', 'NB4', '2012-02-08', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Nobles Victoires', 'NB3', '2011-11-16', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc - Pouvoirs Émergents', 'NB2', '2011-08-31', (SELECT id FROM series WHERE code = 'NB')),
('Noir & Blanc', 'NB1', '2011-04-06', (SELECT id FROM series WHERE code = 'NB'));

-- Ajout des extensions pour la série L'appel des légendes
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- L'appel des légendes (2011)
('L''appel des légendes', 'CL', '2011-02-09', (SELECT id FROM series WHERE code = 'CL'));

-- Ajout des extensions pour la série HeartGold SoulSilver
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- HeartGold SoulSilver (2010-2011)
('HeartGold SoulSilver - Déchaînement', 'HGSS4', '2010-11-10', (SELECT id FROM series WHERE code = 'HGSS')),
('HeartGold SoulSilver - Indomptable', 'HGSS3', '2010-08-18', (SELECT id FROM series WHERE code = 'HGSS')),
('HeartGold SoulSilver - Triomphe', 'HGSS2', '2010-05-12', (SELECT id FROM series WHERE code = 'HGSS')),
('HeartGold SoulSilver', 'HGSS1', '2010-02-10', (SELECT id FROM series WHERE code = 'HGSS'));

-- Ajout des extensions pour la série Platine
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- Platine (2009-2010)
('Platine - Arceus', 'PL4', '2009-11-04', (SELECT id FROM series WHERE code = 'PL')),
('Platine - Rivaux Émergents', 'PL3', '2009-08-19', (SELECT id FROM series WHERE code = 'PL')),
('Platine - Vainqueurs Suprêmes', 'PL2', '2009-05-16', (SELECT id FROM series WHERE code = 'PL')),
('Platine', 'PL1', '2009-02-11', (SELECT id FROM series WHERE code = 'PL'));

-- Ajout des extensions pour la série Diamant & Perle
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- Diamant & Perle (2007-2009)
('Diamant & Perle - Éveil des Légendes', 'DP7', '2008-11-05', (SELECT id FROM series WHERE code = 'DP')),
('Diamant & Perle - Duels au Sommet', 'DP6', '2008-08-20', (SELECT id FROM series WHERE code = 'DP')),
('Diamant & Perle - Aube Majestueuse', 'DP5', '2008-05-21', (SELECT id FROM series WHERE code = 'DP')),
('Diamant & Perle - Merveilles Secrètes', 'DP4', '2008-02-13', (SELECT id FROM series WHERE code = 'DP')),
('Diamant & Perle - Trésors Mystérieux', 'DP3', '2007-11-07', (SELECT id FROM series WHERE code = 'DP')),
('Diamant & Perle - Trésors Mystérieux', 'DP2', '2007-08-22', (SELECT id FROM series WHERE code = 'DP')),
('Diamant & Perle', 'DP1', '2007-05-23', (SELECT id FROM series WHERE code = 'DP'));

-- Ajout des extensions pour la série EX
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- EX (2003-2008)
('EX - Duels au Sommet', 'EX16', '2007-02-14', (SELECT id FROM series WHERE code = 'EX')),
('EX - Forces Cachées', 'EX15', '2006-11-08', (SELECT id FROM series WHERE code = 'EX')),
('EX - Dragon', 'EX14', '2006-08-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Espèces Delta', 'EX13', '2006-05-03', (SELECT id FROM series WHERE code = 'EX')),
('EX - Légendes Oubliées', 'EX12', '2006-02-13', (SELECT id FROM series WHERE code = 'EX')),
('EX - Gardiens de Cristal', 'EX11', '2005-11-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Deoxys', 'EX10', '2005-08-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Emeraude', 'EX9', '2005-05-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Team Magma VS Team Aqua', 'EX8', '2004-03-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Tempête de Sable', 'EX7', '2003-12-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Rouge Feu & Vert Feuille', 'EX6', '2003-09-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Team Rocket Returns', 'EX5', '2003-06-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Forces Cachées', 'EX4', '2003-03-01', (SELECT id FROM series WHERE code = 'EX')),
('EX - Dragon', 'EX3', '2003-01-15', (SELECT id FROM series WHERE code = 'EX'));

-- Ajout des extensions pour la série Wizards
INSERT INTO extensions (name, code, release_date, series_id) VALUES
-- Wizards (1999-2003)
('Skyridge', 'SK', '2003-05-12', (SELECT id FROM series WHERE code = 'WIZ')),
('Aquapolis', 'AQ', '2003-01-15', (SELECT id FROM series WHERE code = 'WIZ')),
('Expedition', 'EXP', '2002-09-15', (SELECT id FROM series WHERE code = 'WIZ')),
('Legendary Collection', 'LC', '2002-05-24', (SELECT id FROM series WHERE code = 'WIZ')),
('Neo Destiny', 'ND', '2002-02-28', (SELECT id FROM series WHERE code = 'WIZ')),
('Neo Discovery', 'N3', '2001-06-01', (SELECT id FROM series WHERE code = 'WIZ')),
('Neo Genesis', 'N1', '2000-12-16', (SELECT id FROM series WHERE code = 'WIZ')),
('Gym Challenge', 'G2', '2000-10-16', (SELECT id FROM series WHERE code = 'WIZ')),
('Gym Heroes', 'G1', '2000-08-14', (SELECT id FROM series WHERE code = 'WIZ')),
('Team Rocket', 'TR', '2000-04-24', (SELECT id FROM series WHERE code = 'WIZ')),
('Base Set 2', 'B2', '2000-02-24', (SELECT id FROM series WHERE code = 'WIZ')),
('Jungle', 'JU', '1999-06-16', (SELECT id FROM series WHERE code = 'WIZ')),
('Fossil', 'FO', '1999-10-10', (SELECT id FROM series WHERE code = 'WIZ')),
('Set de Base', 'BS', '1999-01-09', (SELECT id FROM series WHERE code = 'WIZ')); 