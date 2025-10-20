import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const orderId = params.id;
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch order
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        services (name, description, base_price)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    // Check if user is authorized to view this order
    const adminPhones = process.env.ADMIN_PHONE_NUMBERS?.split(',') || [];
    const isAdmin = user.phone && adminPhones.includes(user.phone);
    
    if (!isAdmin && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT - Update an order (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const orderId = params.id;
    const body = await request.json();
    
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

    const { status, final_price, admin_notes } = body;

    // Build update object
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (final_price !== undefined) updates.final_price = final_price;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

