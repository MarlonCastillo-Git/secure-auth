import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export const metadata = {title:'Recuperar acceso',robots:{index:false,follow:false}};
export default function Forgot() { return <AuthShell title="Recupera tu acceso" description="Te enviaremos instrucciones si existe una cuenta asociada al correo. Abre el enlace en este mismo navegador."><AuthForm mode="recover" disabled={!isSupabaseConfigured()}/><Link href="/login">Volver al inicio de sesión</Link></AuthShell>; }
