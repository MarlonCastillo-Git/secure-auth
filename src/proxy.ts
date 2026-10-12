import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV !== 'production';
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : '';
  const csp = ["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,`style-src 'self' 'nonce-${nonce}'`,"img-src 'self' data:","font-src 'self'",`connect-src 'self' ${supabaseOrigin}${dev ? ' ws: wss:' : ''}`,"object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'"].join('; ');
  const h = new Headers(request.headers);
  h.set('x-nonce',nonce);h.set('Content-Security-Policy',csp);
  // Rechazo temprano de mutaciones de origen externo. Las acciones también
  // validan SITE_URL y Next.js conserva su propia comprobación Origin/Host.
  let response: NextResponse;
  if (!['GET','HEAD','OPTIONS'].includes(request.method) && (!process.env.SITE_URL || request.headers.get('origin') !== new URL(process.env.SITE_URL).origin)) {
    response = new NextResponse('Solicitud no permitida.',{status:403});
  } else {
    response = await updateSession(request,h);
  }
  response.headers.set('Content-Security-Policy',csp);
  response.headers.set('Cache-Control','private, no-store, max-age=0');
  response.headers.set('Referrer-Policy','no-referrer');
  response.headers.set('X-Content-Type-Options','nosniff');
  response.headers.set('X-Frame-Options','DENY');
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if (!dev) response.headers.set('Strict-Transport-Security','max-age=31536000');
  return response;
}
export const config = {matcher:['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']};
