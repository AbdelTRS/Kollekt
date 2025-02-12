-- Renommer la colonne collection en item_name
ALTER TABLE items
RENAME COLUMN collection TO item_name;

-- Mise à jour de la contrainte valid_sealed_fields
ALTER TABLE items
DROP CONSTRAINT IF EXISTS valid_sealed_fields;

ALTER TABLE items
ADD CONSTRAINT valid_sealed_fields CHECK (
    (type = 'SCELLE' AND 
     sub_type IS NOT NULL AND 
     purchase_price IS NOT NULL AND 
     item_name IS NOT NULL AND 
     purchase_date IS NOT NULL AND 
     purchase_location IS NOT NULL)
    OR
    (type = 'CARTE')
); 