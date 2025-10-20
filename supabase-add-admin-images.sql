-- Add admin_images column to orders table
-- Run this in Supabase SQL Editor

-- Add admin_images column if it doesn't exist
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS admin_images TEXT[] DEFAULT '{}';

-- Add comment to column
COMMENT ON COLUMN orders.admin_images IS 'Array of image URLs uploaded by admin (progress/completed photos)';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_admin_images ON orders USING GIN(admin_images);

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'admin_images';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ admin_images column added successfully!';
  RAISE NOTICE '✅ Admins can now upload progress/completed photos';
  RAISE NOTICE '✅ Test it in the admin order details page';
END $$;

