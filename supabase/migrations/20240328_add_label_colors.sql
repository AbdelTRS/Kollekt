-- Création de la table pour les couleurs des étiquettes
CREATE TABLE IF NOT EXISTS label_colors (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    value VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    UNIQUE(category, value)
);

-- Insertion des couleurs pour les types d'items scellés
INSERT INTO label_colors (category, value, color) VALUES
    ('sealed_type', 'Elite Trainer Box', 'blue'),
    ('sealed_type', 'Blister', 'green'),
    ('sealed_type', 'Display', 'purple'),
    ('sealed_type', 'Coffret', 'orange'),
    ('sealed_type', 'UPC', 'red'),
    ('sealed_type', 'Tripack', 'teal'),
    ('sealed_type', 'Duopack', 'cyan'),
    ('sealed_type', 'Bundle', 'pink'),
    ('sealed_type', 'Demi display', 'purple'),
    ('sealed_type', 'Mini-tins', 'yellow'),
    ('sealed_type', 'Tin cube', 'orange'),
    ('sealed_type', 'Booster en lose', 'green'),
    ('sealed_type', 'Artset', 'blue')
ON CONFLICT (category, value) DO UPDATE SET color = EXCLUDED.color;

-- Insertion des couleurs pour les langues de cartes
INSERT INTO label_colors (category, value, color) VALUES
    ('card_language', 'FR', 'blue'),
    ('card_language', 'JAP', 'red')
ON CONFLICT (category, value) DO UPDATE SET color = EXCLUDED.color; 