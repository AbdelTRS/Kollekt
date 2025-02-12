-- Ajout de la colonne card_number à la table items
ALTER TABLE items
ADD COLUMN card_number TEXT;

-- Mise à jour de la contrainte valid_card_fields pour inclure card_number
ALTER TABLE items
DROP CONSTRAINT IF EXISTS valid_card_fields;

ALTER TABLE items
ADD CONSTRAINT valid_card_fields CHECK (
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
); 