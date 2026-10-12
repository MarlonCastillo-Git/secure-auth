import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export async function GET() {
  const headers = {'Cache-Control':'private, no-store'};
  if (!isSupabaseConfigured()) return NextResponse.json({error:'Servicio no configurado.'},{status:503,headers});
  try {
    const supabase = await createServerSupabase();
    const {data:{user},error} = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({user:null},{status:401,headers});
    return NextResponse.json({user:{id:user.id,email:user.email ?? null}},{headers});
  } catch { return NextResponse.json({error:'Servicio no disponible.'},{status:503,headers}); }
}
