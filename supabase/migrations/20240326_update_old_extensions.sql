-- Mise à jour des extensions de la série XY
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'XY')
WHERE name IN (
    'XY - Impact des Destins',
    'XY - Générations',
    'XY - Poings Furieux',
    'XY - Impulsion TURBO',
    'XY - Origines Antiques',
    'XY - Ciel Rugissant',
    'XY - Primo Choc',
    'XY - Phantom Forces',
    'XY - Étincelles',
    'XY',
    'XY - Kalos'
);

-- Mise à jour des extensions de la série Noir & Blanc
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'NB')
WHERE name IN (
    'Noir & Blanc - Glaciation Plasma',
    'Noir & Blanc - Explosion Plasma',
    'Noir & Blanc - Frontières Franchies',
    'Noir & Blanc - Dragons Exaltés',
    'Noir & Blanc - Explorateurs Obscurs',
    'Noir & Blanc - Destinées Futures',
    'Noir & Blanc - Nobles Victoires',
    'Noir & Blanc - Pouvoirs Émergents',
    'Noir & Blanc'
);

-- Mise à jour des extensions de la série L'appel des légendes
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'CL')
WHERE name = 'L''appel des légendes';

-- Mise à jour des extensions de la série HeartGold SoulSilver
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'HGSS')
WHERE name IN (
    'HeartGold SoulSilver - Déchaînement',
    'HeartGold SoulSilver - Indomptable',
    'HeartGold SoulSilver - Triomphe',
    'HeartGold SoulSilver'
);

-- Mise à jour des extensions de la série Platine
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'PL')
WHERE name IN (
    'Platine - Arceus',
    'Platine - Rivaux Émergents',
    'Platine - Vainqueurs Suprêmes',
    'Platine'
);

-- Mise à jour des extensions de la série Diamant & Perle
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'DP')
WHERE name IN (
    'Diamant & Perle - Éveil des Légendes',
    'Diamant & Perle - Duels au Sommet',
    'Diamant & Perle - Aube Majestueuse',
    'Diamant & Perle - Merveilles Secrètes',
    'Diamant & Perle - Trésors Mystérieux',
    'Diamant & Perle'
);

-- Mise à jour des extensions de la série EX
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'EX')
WHERE name IN (
    'EX - Duels au Sommet',
    'EX - Forces Cachées',
    'EX - Dragon',
    'EX - Espèces Delta',
    'EX - Légendes Oubliées',
    'EX - Gardiens de Cristal',
    'EX - Deoxys',
    'EX - Emeraude',
    'EX - Team Magma VS Team Aqua',
    'EX - Tempête de Sable',
    'EX - Rouge Feu & Vert Feuille',
    'EX - Team Rocket Returns'
);

-- Mise à jour des extensions de la série Wizards
UPDATE extensions 
SET series_id = (SELECT id FROM series WHERE code = 'WIZ')
WHERE name IN (
    'Skyridge',
    'Aquapolis',
    'Expedition',
    'Legendary Collection',
    'Neo Destiny',
    'Neo Discovery',
    'Neo Genesis',
    'Gym Challenge',
    'Gym Heroes',
    'Team Rocket',
    'Base Set 2',
    'Jungle',
    'Fossil',
    'Set de Base'
); 