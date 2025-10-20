-- Smile Alteration and Fashions Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for available services
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for customer orders
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_notes TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    -- Status options: 'pending', 'quoted', 'approved', 'in_progress', 'ready', 'completed', 'cancelled'
    final_price NUMERIC(10, 2),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for appointments (Phase 2 feature)
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    -- Status options: 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default services
INSERT INTO services (name, description, base_price) VALUES
('Baju Kurung Alteration', 'Alteration services for baju kurung', 50.00),
('Baju Melayu Alteration', 'Alteration services for baju melayu', 50.00),
('Custom Baju Kurung', 'Custom-made baju kurung tailored to your measurements', 200.00),
('Custom Baju Melayu', 'Custom-made baju melayu tailored to your measurements', 180.00),
('Pants Alteration', 'Hemming and fitting for pants', 30.00),
('Dress Alteration', 'General dress alteration services', 60.00),
('Other Alteration', 'Other alteration services', NULL);

-- Create indexes for better query performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for services table (everyone can read)
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (is_active = true);

-- RLS Policies for orders table
-- Allow anyone to create orders (guest checkout)
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Admin policies will be handled in the API routes with service role key

-- RLS Policies for appointments table
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW order_statistics AS
SELECT
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'ready') as ready_count,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
    COUNT(*) as total_orders,
    SUM(final_price) FILTER (WHERE status = 'completed') as total_revenue
FROM orders;

