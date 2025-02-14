-- Ajout des colonnes pour les précommandes
ALTER TABLE items
ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expected_date DATE;

-- Création d'une fonction pour déplacer un item de précommande vers la collection
CREATE OR REPLACE FUNCTION move_preorder_to_collection(
    p_item_ids UUID[],
    p_user_id UUID
) RETURNS void AS $$
DECLARE
    v_item_id UUID;
    v_existing_item_id UUID;
BEGIN
    FOREACH v_item_id IN ARRAY p_item_ids
    LOOP
        -- Vérifier si un item similaire existe déjà dans la collection
        SELECT id INTO v_existing_item_id
        FROM items
        WHERE user_id = p_user_id
        AND is_preorder = FALSE
        AND (
            (type = 'CARTE' AND card_name = (SELECT card_name FROM items WHERE id = v_item_id))
            OR
            (type = 'SCELLE' AND item_name = (SELECT item_name FROM items WHERE id = v_item_id))
        )
        AND series_id = (SELECT series_id FROM items WHERE id = v_item_id)
        AND extension_id = (SELECT extension_id FROM items WHERE id = v_item_id)
        LIMIT 1;

        IF v_existing_item_id IS NOT NULL THEN
            -- Mettre à jour la quantité de l'item existant
            UPDATE items
            SET quantity = quantity + (SELECT quantity FROM items WHERE id = v_item_id)
            WHERE id = v_existing_item_id;

            -- Supprimer la précommande
            DELETE FROM items WHERE id = v_item_id;
        ELSE
            -- Mettre à jour l'item pour le marquer comme reçu
            UPDATE items
            SET is_preorder = FALSE
            WHERE id = v_item_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION move_preorder_to_collection(UUID[], UUID) TO authenticated; 