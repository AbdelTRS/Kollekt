-- Vérifier si la colonne collection existe et la renommer en item_name
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'items'
        AND column_name = 'collection'
    ) THEN
        ALTER TABLE items RENAME COLUMN collection TO item_name;
    ELSE
        -- Si ni collection ni item_name n'existe, ajouter item_name
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'items'
            AND column_name = 'item_name'
        ) THEN
            ALTER TABLE items ADD COLUMN item_name TEXT;
        END IF;
    END IF;
END $$;

-- Mettre à jour les données existantes pour les items scellés sans item_name
UPDATE items
SET item_name = COALESCE(item_name, 'Item sans nom')
WHERE type = 'SCELLE' AND item_name IS NULL;

-- Mise à jour de la contrainte valid_sealed_fields
ALTER TABLE items DROP CONSTRAINT IF EXISTS valid_sealed_fields;

-- Ajouter la nouvelle contrainte
ALTER TABLE items ADD CONSTRAINT valid_sealed_fields CHECK (
    (type = 'SCELLE' AND 
     sub_type IS NOT NULL AND 
     purchase_price IS NOT NULL AND 
     item_name IS NOT NULL AND 
     purchase_date IS NOT NULL AND 
     purchase_location IS NOT NULL)
    OR
    (type = 'CARTE')
); 