-- Create sales table
CREATE TABLE sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
    sale_date DATE NOT NULL,
    sale_location TEXT NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    
    CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- Create indexes
CREATE INDEX sales_user_id_idx ON sales(user_id);
CREATE INDEX sales_item_id_idx ON sales(item_id);
CREATE INDEX sales_date_idx ON sales(sale_date);

-- Configure RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales"
    ON sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
    ON sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add trigger to update items quantity
CREATE OR REPLACE FUNCTION update_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE items
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_item_quantity_after_sale
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_item_quantity(); 