-- Ajout de la colonne market_value à la table items
ALTER TABLE items ADD COLUMN market_value DECIMAL(10, 2);

-- Fonction pour calculer la valeur totale du marché
CREATE OR REPLACE FUNCTION calculate_total_market_value(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(market_value * quantity), 0)
    INTO total
    FROM items
    WHERE user_id = p_user_id
    AND market_value IS NOT NULL;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql; 