'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { assertSameOrigin, siteOrigin } from '@/lib/auth/security';
import { signupSchema, loginSchema, emailSchema, passwordSchema, type ActionState } from '@/lib/auth/validation';
const unavailable = {error:'No pudimos completar la solicitud. Inténtalo de nuevo más tarde.'};
async function client() {
  await assertSameOrigin();
  if (!isSupabaseConfigured()) throw new Error('Sin configuración');
  return createServerSupabase();
}
export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return {error:parsed.error.issues[0].message};
  try {
    const supabase = await client();
    const {error} = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return {error:'No fue posible iniciar sesión. Revisa tus credenciales y la confirmación de tu correo.'};
  } catch { return unavailable; }
  revalidatePath('/','layout');
  redirect('/dashboard');
}
export async function signup(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return {error:parsed.error.issues[0].message};
  try {
    const supabase = await client();
    const {name,email,password} = parsed.data;
    const {data,error} = await supabase.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:`${siteOrigin()}/auth/callback`}});
    if (error || !data.session) return {success:'Si el registro puede completarse, recibirás un correo con los siguientes pasos. Revisa también la carpeta de spam.'};
  } catch { return unavailable; }
  revalidatePath('/','layout');
  redirect('/dashboard');
}
export async function recover(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return {error:parsed.error.issues[0].message};
  try {
    const supabase = await client();
    await supabase.auth.resetPasswordForEmail(parsed.data.email,{redirectTo:`${siteOrigin()}/auth/callback?next=/update-password`});
  } catch { return unavailable; }
  return {success:'Si el correo corresponde a una cuenta, recibirás instrucciones para recuperar el acceso.'};
}
export async function updatePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return {error:parsed.error.issues[0].message};
  try {
    const supabase = await client();
    const {data:{user},error:authError} = await supabase.auth.getUser();
    if (authError || !user) return {error:'Tu sesión expiró. Solicita otro enlace de recuperación.'};
    const {error} = await supabase.auth.updateUser({password:parsed.data.password});
    if (error) return {error:'No se pudo actualizar la contraseña. Comprueba los requisitos o solicita un nuevo enlace.'};
    const {error:logoutError} = await supabase.auth.signOut({scope:'global'});
    if (logoutError) return {success:'Contraseña actualizada. No se pudieron cerrar todas las sesiones; vuelve a intentarlo desde tu perfil.'};
  } catch { return unavailable; }
  revalidatePath('/','layout');
  redirect('/login?notice=password');
}
export async function logout(): Promise<void> {
  let failed = false;
  try {
    const supabase = await client();
    const {error} = await supabase.auth.signOut({scope:'local'});
    failed = Boolean(error);
  } catch { failed = true; }
  if (failed) redirect('/dashboard?notice=logout');
  revalidatePath('/','layout');
  redirect('/login');
}
