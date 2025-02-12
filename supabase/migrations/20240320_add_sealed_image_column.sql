-- Add sealed_image column to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS sealed_image TEXT;

-- Update the valid_sealed_fields constraint to include sealed_image
ALTER TABLE items
DROP CONSTRAINT IF EXISTS valid_sealed_fields;

ALTER TABLE items
ADD CONSTRAINT valid_sealed_fields CHECK (
    (type = 'SCELLE' AND 
     sub_type IS NOT NULL AND 
     purchase_price IS NOT NULL AND 
     collection IS NOT NULL AND 
     purchase_date IS NOT NULL AND 
     purchase_location IS NOT NULL)
    OR
    (type = 'CARTE')
); 