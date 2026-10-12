import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export const getUser = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase(true);
  const {data:{user},error} = await supabase.auth.getUser();
  if (error) return null;
  return user;
});
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}
