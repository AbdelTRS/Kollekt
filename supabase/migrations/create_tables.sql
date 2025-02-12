-- Suppression des éléments existants
DROP TABLE IF EXISTS items;
DROP TYPE IF EXISTS item_type;
DROP TYPE IF EXISTS sealed_type;
DROP TYPE IF EXISTS card_language;

-- Création des types énumérés
CREATE TYPE item_type AS ENUM ('SCELLE', 'CARTE');
CREATE TYPE sealed_type AS ENUM ('Elite Trainer Box', 'Blister', 'Display', 'Coffret', 'UPC');
CREATE TYPE card_language AS ENUM ('FR', 'JAP');

-- Création de la table items
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Champs communs
    type item_type NOT NULL,
    
    -- Champs pour les items scellés
    sub_type sealed_type,
    purchase_price DECIMAL(10,2),
    collection TEXT,
    purchase_date DATE,
    purchase_location TEXT,
    sealed_image TEXT,
    
    -- Champs pour les cartes
    language card_language,
    card_name TEXT,
    card_image TEXT,
    quantity INTEGER,
    is_purchased BOOLEAN DEFAULT false,
    card_purchase_price DECIMAL(10,2),
    card_purchase_date DATE,
    card_purchase_location TEXT,
    
    -- Contraintes
    CONSTRAINT valid_sealed_fields CHECK (
        (type = 'SCELLE' AND sub_type IS NOT NULL AND purchase_price IS NOT NULL AND collection IS NOT NULL AND purchase_date IS NOT NULL AND purchase_location IS NOT NULL)
        OR
        (type = 'CARTE')
    ),
    CONSTRAINT valid_card_fields CHECK (
        (type = 'CARTE' AND 
         language IS NOT NULL AND 
         card_name IS NOT NULL AND
         card_image IS NOT NULL AND
         quantity IS NOT NULL AND
         (
           (is_purchased = true AND card_purchase_price IS NOT NULL AND card_purchase_date IS NOT NULL AND card_purchase_location IS NOT NULL) OR
           (is_purchased = false AND card_purchase_price IS NULL AND card_purchase_date IS NULL AND card_purchase_location IS NULL)
         )
        )
        OR
        (type = 'SCELLE')
    )
);

-- Création des index
CREATE INDEX items_type_idx ON items(type);
CREATE INDEX items_user_id_idx ON items(user_id);

-- Configuration de la sécurité
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own items"
    ON items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
    ON items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
    ON items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
    ON items FOR DELETE
    USING (auth.uid() = user_id);

-- Gestion des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 