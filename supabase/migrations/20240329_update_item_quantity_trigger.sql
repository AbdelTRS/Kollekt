-- Suppression des anciens triggers et fonctions
DROP TRIGGER IF EXISTS update_item_quantity_before_sale ON sales;
DROP TRIGGER IF EXISTS update_item_quantity_after_sale ON sales;
DROP FUNCTION IF EXISTS update_item_quantity();
DROP FUNCTION IF EXISTS update_item_quantity_after();

-- Création d'une procédure stockée pour gérer la vente
CREATE OR REPLACE FUNCTION process_sale(
    p_item_id UUID,
    p_user_id UUID,
    p_sale_date DATE,
    p_sale_location TEXT,
    p_sale_price DECIMAL,
    p_quantity INTEGER
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item RECORD;
    v_updated_quantity INTEGER;
BEGIN
    -- Début de la transaction
    BEGIN
        -- Verrouiller l'item pour éviter les conflits
        SELECT * INTO v_item
        FROM items
        WHERE id = p_item_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Item not found';
        END IF;

        -- Vérifier la quantité disponible
        IF v_item.quantity < p_quantity THEN
            RAISE EXCEPTION 'Insufficient quantity. Available: %, Requested: %', v_item.quantity, p_quantity;
        END IF;

        -- Générer un nouvel ID pour la vente
        v_sale_id := gen_random_uuid();

        -- Insérer la vente avec toutes les informations de l'item
        INSERT INTO sales (
            id,
            item_id,
            user_id,
            sale_date,
            sale_location,
            sale_price,
            quantity,
            type,
            card_name,
            item_name,
            card_image,
            sealed_image,
            series_id,
            extension_id,
            sub_type,
            language,
            purchase_price,
            purchase_date,
            purchase_location,
            card_purchase_price,
            card_purchase_date,
            card_purchase_location
        ) VALUES (
            v_sale_id,
            p_item_id,
            p_user_id,
            p_sale_date,
            p_sale_location,
            p_sale_price,
            p_quantity,
            v_item.type,
            v_item.card_name,
            v_item.item_name,
            v_item.card_image,
            v_item.sealed_image,
            v_item.series_id,
            v_item.extension_id,
            v_item.sub_type,
            v_item.language,
            v_item.purchase_price,
            v_item.purchase_date,
            v_item.purchase_location,
            v_item.card_purchase_price,
            v_item.card_purchase_date,
            v_item.card_purchase_location
        );

        -- Mettre à jour la quantité de l'item
        UPDATE items
        SET quantity = quantity - p_quantity
        WHERE id = p_item_id
        RETURNING quantity INTO v_updated_quantity;

        -- Si la quantité atteint 0, supprimer l'item
        IF v_updated_quantity <= 0 THEN
            DELETE FROM items WHERE id = p_item_id;
        END IF;

        -- Valider la transaction
        RETURN v_sale_id;
    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur, annuler la transaction
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION process_sale(UUID, UUID, DATE, TEXT, DECIMAL, INTEGER) TO authenticated; 