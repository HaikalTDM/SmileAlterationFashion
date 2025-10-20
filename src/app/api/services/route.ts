import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all active services
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

