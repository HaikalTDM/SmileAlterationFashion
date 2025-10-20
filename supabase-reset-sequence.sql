-- Function to reset the orders sequence to 1
-- This function will be called when all orders are deleted
CREATE OR REPLACE FUNCTION reset_orders_sequence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset the sequence to start from 1
  ALTER SEQUENCE orders_id_seq RESTART WITH 1;
END;
$$;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION reset_orders_sequence() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_orders_sequence() TO anon;

