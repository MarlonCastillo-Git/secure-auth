import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/auth/security';
export async function GET(request: NextRequest) {
  const origin = siteOrigin();
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') === '/update-password' ? '/update-password' : '/dashboard';
  if (code && code.length <= 2048) {
    try {
      const supabase = await createServerSupabase();
      // PKCE: el código debe corresponder al verificador httpOnly de este navegador.
      const {error} = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next,origin),303);
    } catch { /* No devolver tokens ni detalles internos al navegador. */ }
  }
  return NextResponse.redirect(new URL('/login?notice=link',origin),303);
}
