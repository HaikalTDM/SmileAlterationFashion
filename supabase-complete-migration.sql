-- COMPLETE MIGRATION: Update Orders Table Structure
-- Run this in Supabase SQL Editor to fix the schema

-- Step 1: Add new columns (if they don't exist)
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS service TEXT,
  ADD COLUMN IF NOT EXISTS details TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[],
  ADD COLUMN IF NOT EXISTS order_type TEXT;

-- Step 2: Remove NOT NULL constraints from old columns
ALTER TABLE orders 
  ALTER COLUMN customer_name DROP NOT NULL,
  ALTER COLUMN customer_phone DROP NOT NULL;

-- Step 3: Copy existing data to new columns (if any exists)
UPDATE orders 
SET 
  name = COALESCE(name, customer_name),
  phone = COALESCE(phone, customer_phone),
  details = COALESCE(details, customer_notes)
WHERE name IS NULL OR phone IS NULL OR details IS NULL;

-- Step 4: Drop old columns (optional - uncomment if you want to remove them completely)
-- ALTER TABLE orders 
--   DROP COLUMN IF EXISTS customer_name,
--   DROP COLUMN IF EXISTS customer_phone,
--   DROP COLUMN IF EXISTS customer_notes,
--   DROP COLUMN IF EXISTS image_url,
--   DROP COLUMN IF EXISTS service_id,
--   DROP COLUMN IF EXISTS user_id;

-- Step 5: Set default status if NULL
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Step 6: Drop ALL existing RLS policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for service role" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Step 7: Disable RLS temporarily to allow operations
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 8: Re-enable RLS with new simple policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 9: Create new permissive policies
CREATE POLICY "Allow all inserts" ON orders
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all selects" ON orders
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all updates" ON orders
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all deletes" ON orders
  FOR DELETE 
  USING (true);

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_name ON orders(name);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- Step 11: Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON orders;
CREATE TRIGGER update_orders_updated_at_trigger 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_orders_updated_at();

-- Step 12: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Step 13: Show current policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'New columns added: name, phone, service, details, image_urls, order_type';
  RAISE NOTICE 'RLS policies updated to allow public access';
  RAISE NOTICE 'You can now submit orders from the app';
END $$;

