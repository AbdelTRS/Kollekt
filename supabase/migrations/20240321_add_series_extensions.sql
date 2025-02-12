-- Création de la table des séries
CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    release_year INTEGER NOT NULL,
    UNIQUE(name)
);

-- Création de la table des extensions
CREATE TABLE extensions (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    release_date DATE NOT NULL,
    card_count INTEGER,
    UNIQUE(name)
);

-- Ajout des colonnes dans la table items
ALTER TABLE items
ADD COLUMN series_id INTEGER REFERENCES series(id),
ADD COLUMN extension_id INTEGER REFERENCES extensions(id);

-- Insertion des séries (de la plus ancienne à la plus récente)
INSERT INTO series (name, code, release_year) VALUES
('Wizards', 'WIZ', 1999),
('EX', 'EX', 2003),
('Diamant et Perle', 'DP', 2007),
('Platine', 'PL', 2009),
('HeartGold SoulSilver', 'HGSS', 2010),
('L''appel des légendes', 'CL', 2011),
('Noir et Blanc', 'NB', 2011),
('XY', 'XY', 2013),
('Soleil et Lune', 'SL', 2017),
('Épée et Bouclier', 'EB', 2020),
('Écarlate et Violet', 'EV', 2023);

-- Insertion des extensions pour chaque série
-- Écarlate et Violet
INSERT INTO extensions (series_id, name, code, release_date, card_count) VALUES
((SELECT id FROM series WHERE code = 'EV'), 'Écarlate et Violet', 'EV01', '2023-03-31', 198),
((SELECT id FROM series WHERE code = 'EV'), 'Évolutions à Paldéa', 'EV02', '2023-06-09', 279),
((SELECT id FROM series WHERE code = 'EV'), 'Flammes Obsidiennes', 'EV03', '2023-08-11', 230),
((SELECT id FROM series WHERE code = 'EV'), 'Pokémon 151', 'EV3.5', '2023-09-22', 207),
((SELECT id FROM series WHERE code = 'EV'), 'Faille Paradoxe', 'EV04', '2023-11-03', 266),
((SELECT id FROM series WHERE code = 'EV'), 'Destinées de Paldea', 'EV4.5', '2024-01-26', 245),
((SELECT id FROM series WHERE code = 'EV'), 'Forces Temporelles', 'EV05', '2024-03-22', 218),
((SELECT id FROM series WHERE code = 'EV'), 'Mascarade Crépusculaire', 'EV06', '2024-05-24', 226),
((SELECT id FROM series WHERE code = 'EV'), 'Fable Nébuleuse', 'EV6.5', '2024-08-02', 200),
((SELECT id FROM series WHERE code = 'EV'), 'Couronne Stellaire', 'EV07', '2024-09-13', 175),
((SELECT id FROM series WHERE code = 'EV'), 'Étincelles Déferlantes', 'EV08', '2024-11-08', 252),
((SELECT id FROM series WHERE code = 'EV'), 'Évolutions Prismatiques', 'EV8.5', '2025-01-17', 180),
((SELECT id FROM series WHERE code = 'EV'), 'Aventure Ensemble', 'EV09', '2025-03-28', 150);

-- Épée et Bouclier
INSERT INTO extensions (series_id, name, code, release_date, card_count) VALUES
((SELECT id FROM series WHERE code = 'EB'), 'Épée et Bouclier', 'EB01', '2020-02-07', 202),
((SELECT id FROM series WHERE code = 'EB'), 'Clash des Rebelles', 'EB02', '2020-05-01', 192),
((SELECT id FROM series WHERE code = 'EB'), 'Ténèbres Embrasées', 'EB03', '2020-08-14', 189),
((SELECT id FROM series WHERE code = 'EB'), 'La Voie du Maître', 'EB3.5', '2020-09-25', 73),
((SELECT id FROM series WHERE code = 'EB'), 'Voltage Éclatant', 'EB04', '2020-11-13', 185),
((SELECT id FROM series WHERE code = 'EB'), 'Destinées Radieuses', 'EB4.5', '2021-02-19', 72),
((SELECT id FROM series WHERE code = 'EB'), 'Styles de Combat', 'EB05', '2021-03-19', 163),
((SELECT id FROM series WHERE code = 'EB'), 'Règne de Glace', 'EB06', '2021-06-18', 198),
((SELECT id FROM series WHERE code = 'EB'), 'Évolution Céleste', 'EB07', '2021-08-27', 203),
((SELECT id FROM series WHERE code = 'EB'), 'Célébrations', 'EB7.5', '2021-10-08', 50),
((SELECT id FROM series WHERE code = 'EB'), 'Poing de Fusion', 'EB08', '2021-11-12', 264),
((SELECT id FROM series WHERE code = 'EB'), 'Stars Étincelantes', 'EB09', '2022-02-25', 172),
((SELECT id FROM series WHERE code = 'EB'), 'Astres Radieux', 'EB10', '2022-05-27', 189),
((SELECT id FROM series WHERE code = 'EB'), 'Pokémon GO', 'EB10.5', '2022-07-01', 88),
((SELECT id FROM series WHERE code = 'EB'), 'Origine Perdue', 'EB11', '2022-09-09', 196),
((SELECT id FROM series WHERE code = 'EB'), 'Tempête Argentée', 'EB12', '2022-11-11', 197),
((SELECT id FROM series WHERE code = 'EB'), 'Zénith Suprême', 'EB12.5', '2023-01-20', 110);

-- Soleil et Lune
INSERT INTO extensions (series_id, name, code, release_date, card_count) VALUES
((SELECT id FROM series WHERE code = 'SL'), 'Soleil et Lune', 'SL01', '2017-02-03', 149),
((SELECT id FROM series WHERE code = 'SL'), 'Gardiens Ascendants', 'SL02', '2017-05-05', 145),
((SELECT id FROM series WHERE code = 'SL'), 'Ombres Ardentes', 'SL03', '2017-08-04', 147),
((SELECT id FROM series WHERE code = 'SL'), 'Légendes Brillantes', 'SL3.5', '2017-10-06', 73),
((SELECT id FROM series WHERE code = 'SL'), 'Invasion Carmin', 'SL04', '2017-11-03', 114),
((SELECT id FROM series WHERE code = 'SL'), 'Ultra Prisme', 'SL05', '2018-02-02', 156),
((SELECT id FROM series WHERE code = 'SL'), 'Lumière Interdite', 'SL06', '2018-05-04', 131),
((SELECT id FROM series WHERE code = 'SL'), 'Tempête Céleste', 'SL07', '2018-08-03', 168),
((SELECT id FROM series WHERE code = 'SL'), 'Majesté des Dragons', 'SL7.5', '2018-09-07', 70),
((SELECT id FROM series WHERE code = 'SL'), 'Tonnerre Perdu', 'SL08', '2018-11-02', 214),
((SELECT id FROM series WHERE code = 'SL'), 'Duo de Choc', 'SL09', '2019-02-01', 181),
((SELECT id FROM series WHERE code = 'SL'), 'Alliance Infaillible', 'SL10', '2019-05-03', 210),
((SELECT id FROM series WHERE code = 'SL'), 'Harmonie des Esprits', 'SL11', '2019-08-02', 236),
((SELECT id FROM series WHERE code = 'SL'), 'Destinées Occultes', 'SL11.5', '2019-09-13', 73),
((SELECT id FROM series WHERE code = 'SL'), 'Éclipse Cosmique', 'SL12', '2019-11-01', 236);

-- Ajouter les autres séries et extensions de la même manière...
-- Note: Pour la lisibilité, j'ai inclus seulement les séries les plus récentes
-- Il faudrait continuer avec les séries plus anciennes de la même façon