-- Suppression du trigger existant
DROP TRIGGER IF EXISTS check_sealed_type_trigger ON items;

-- Suppression de la fonction existante
DROP FUNCTION IF EXISTS check_sealed_type();

-- Mise à jour du type ENUM
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Tripack';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Duopack';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Bundle';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Demi display';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Mini-tins';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Tin cube';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Booster en lose';
ALTER TYPE sealed_type ADD VALUE IF NOT EXISTS 'Artset';

-- Recréation de la fonction de vérification
CREATE OR REPLACE FUNCTION check_sealed_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'SCELLE' AND NEW.sub_type NOT IN (
    'Elite Trainer Box',
    'Blister',
    'Display',
    'Coffret',
    'UPC',
    'Tripack',
    'Duopack',
    'Bundle',
    'Demi display',
    'Mini-tins',
    'Tin cube',
    'Booster en lose',
    'Artset'
  ) THEN
    RAISE EXCEPTION 'Type d''item scellé non valide';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréation du trigger
CREATE TRIGGER check_sealed_type_trigger
BEFORE INSERT OR UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION check_sealed_type(); 