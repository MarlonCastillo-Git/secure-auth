import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookieOptions, isSupabaseConfigured, supabaseConfig } from './config';
import type { Database } from './database.types';

export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  const pending = new Map<string, {value: string; options: CookieOptions}>();
  let response = NextResponse.next({request: {headers: requestHeaders}});
  const path = request.nextUrl.pathname;
  const privateRoute = path === '/dashboard' || path.startsWith('/dashboard/') || path === '/update-password';
  const authRoute = path === '/login' || path === '/register';
  if (!isSupabaseConfigured()) {
    return privateRoute ? NextResponse.redirect(new URL('/login?notice=setup', request.url)) : response;
  }
  const {url,key} = supabaseConfig();
  const supabase = createServerClient<Database>(url,key, {cookieOptions, cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: items => {
      items.forEach(({name,value,options}) => {
        request.cookies.set(name,value);
        pending.set(name,{value,options:{...options,...cookieOptions}});
      });
      requestHeaders.set('cookie',request.cookies.toString());
      response = NextResponse.next({request:{headers:requestHeaders}});
    },
  }});
  // Valida con Auth; no confiar en getSession() ni en un JWT decodificado.
  const {data:{user},error} = await supabase.auth.getUser();
  if (error && error.status && error.status >= 500 && privateRoute) {
    response = new NextResponse('El servicio de autenticación no está disponible. Inténtalo de nuevo.',{status:503});
  } else if (!user && privateRoute) {
    response = NextResponse.redirect(new URL('/login',request.url));
  } else if (user && authRoute && request.method === 'GET') {
    response = NextResponse.redirect(new URL('/dashboard',request.url));
  }
  pending.forEach(({value,options},name) => response.cookies.set(name,value,options));
  return response;
}
