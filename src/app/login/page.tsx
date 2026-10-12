import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export const metadata = {title:'Iniciar sesión',robots:{index:false,follow:false}};
export default async function Login({searchParams}: {searchParams:Promise<{notice?:string}>}) {
  const {notice} = await searchParams;
  const messages:Record<string,string> = {password:'Contraseña actualizada. Inicia sesión de nuevo.',link:'El enlace expiró o se abrió en otro navegador. Solicita uno nuevo.'};
  return <AuthShell title="Bienvenido de nuevo" description="Accede a tu espacio personal.">{notice && messages[notice] && <p role="status">{messages[notice]}</p>}<AuthForm mode="login" disabled={!isSupabaseConfigured()}/><Link href="/forgot-password">¿Olvidaste tu contraseña?</Link><p>¿Primera vez? <Link href="/register">Crear cuenta</Link></p></AuthShell>;
}
