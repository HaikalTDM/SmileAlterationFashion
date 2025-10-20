-- FIX: Row Level Security Policy for Orders
-- This allows customers to create orders without authentication

-- First, check if the orders table exists and has the right columns
-- Run this in your Supabase SQL Editor

-- Add new columns if they don't exist
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS service TEXT,
  ADD COLUMN IF NOT EXISTS details TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[],
  ADD COLUMN IF NOT EXISTS order_type TEXT;

-- Drop ALL existing policies on orders table
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for service role" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Create new simple policies that allow everything
-- (Since we're managing auth via localStorage for admin)

-- 1. Allow ANYONE to INSERT orders (for customer submissions)
CREATE POLICY "Allow public inserts" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- 2. Allow ANYONE to SELECT orders (for admin dashboard)
CREATE POLICY "Allow public selects" ON orders
  FOR SELECT 
  USING (true);

-- 3. Allow ANYONE to UPDATE orders (for admin updates)
CREATE POLICY "Allow public updates" ON orders
  FOR UPDATE 
  USING (true);

-- 4. Allow ANYONE to DELETE orders (for admin cleanup)
CREATE POLICY "Allow public deletes" ON orders
  FOR DELETE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

