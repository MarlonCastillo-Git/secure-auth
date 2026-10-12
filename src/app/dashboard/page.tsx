import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { createServerSupabase } from '@/lib/supabase/server';
export const metadata = {title:'Mi cuenta',robots:{index:false,follow:false}};
export default async function Dashboard({searchParams}: {searchParams:Promise<{notice?:string}>}) {
  const user = await requireUser();
  const supabase = await createServerSupabase(true);
  const {data:profile,error} = await supabase.from('profiles').select('id,display_name,created_at').eq('id',user.id).maybeSingle();
  const {notice} = await searchParams;
  return <section className="dashboard"><p className="eyebrow">TU ESPACIO PERSONAL</p><h1>Hola{profile?.display_name ? `, ${profile.display_name}`:''}</h1><p className="muted">Tu identidad ha sido verificada por el servidor.</p>{notice==='logout' && <p role="alert" className="error">No se pudo cerrar la sesión. Inténtalo de nuevo.</p>}<dl><dt>Correo electrónico</dt><dd>{user.email}</dd><dt>Identificador de usuario</dt><dd>{user.id}</dd><dt>Correo confirmado</dt><dd>{user.email_confirmed_at ? 'Sí':'Pendiente'}</dd></dl>{(error || !profile) && <p className="setup">El perfil aún no está disponible en la base de datos. Revisa la configuración de la tabla de perfiles.</p>}<Link className="button" href="/update-password">Cambiar contraseña</Link></section>;
}
