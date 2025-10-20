import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all orders (Admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminPhones = process.env.ADMIN_PHONE_NUMBERS?.split(',') || [];
    if (!user.phone || !adminPhones.includes(user.phone)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        services (name, description, base_price)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new order (Guest order - no authentication required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      service_id,
      customer_name,
      customer_phone,
      customer_notes,
      image_url,
    } = body;

    // Validation
    if (!service_id || !customer_name || !customer_phone || !customer_notes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    // This allows guest orders without authentication
    const supabase = await createClient();

    // Create order data (no user_id - guest order)
    const orderData = {
      service_id,
      customer_name,
      customer_phone,
      customer_notes,
      image_url: image_url || null,
      status: 'pending',
      user_id: null, // Always null for guest orders
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

