-- Création d'une fonction pour vérifier les types d'items scellés valides
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

-- Suppression du trigger s'il existe déjà
DROP TRIGGER IF EXISTS check_sealed_type_trigger ON items;

-- Création du trigger
CREATE TRIGGER check_sealed_type_trigger
BEFORE INSERT OR UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION check_sealed_type(); 