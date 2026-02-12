import { NextRequest, NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientForPage();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from('biometric_credentials')
      .update({ is_active: false, last_used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Biometric disable error:', error);
    return NextResponse.json({ error: error.message || 'Failed to disable biometrics' }, { status: 500 });
  }
}