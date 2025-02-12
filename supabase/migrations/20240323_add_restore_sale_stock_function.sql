-- Fonction pour restaurer le stock lors de la suppression d'une vente
CREATE OR REPLACE FUNCTION restore_sale_stock(p_item_id UUID, p_quantity INTEGER, p_sale_id UUID)
RETURNS void AS $$
BEGIN
    -- Vérifier si l'item existe toujours
    IF EXISTS (SELECT 1 FROM items WHERE id = p_item_id) THEN
        -- Mettre à jour la quantité de l'item
        UPDATE items
        SET quantity = quantity + p_quantity
        WHERE id = p_item_id;
    ELSE
        -- Si l'item n'existe plus, le recréer à partir des données de la vente
        INSERT INTO items (
            id,
            user_id,
            type,
            sub_type,
            item_name,
            card_name,
            card_image,
            sealed_image,
            quantity,
            series_id,
            extension_id
        )
        SELECT 
            gen_random_uuid(),
            s.user_id,
            i.type,
            i.sub_type,
            i.item_name,
            i.card_name,
            i.card_image,
            i.sealed_image,
            s.quantity,
            i.series_id,
            i.extension_id
        FROM sales s
        LEFT JOIN items i ON i.id = s.item_id
        WHERE s.id = p_sale_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION restore_sale_stock(UUID, INTEGER, UUID) TO authenticated;

-- S'assurer que RLS est activé sur la table sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Ajouter ou mettre à jour les politiques de sécurité pour la table sales
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
CREATE POLICY "Users can delete their own sales"
    ON sales
    FOR DELETE
    USING (auth.uid() = user_id); 