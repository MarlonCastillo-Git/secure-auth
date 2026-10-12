import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export const metadata = {title:'Crear cuenta',robots:{index:false,follow:false}};
export default function Register() { return <AuthShell title="Crea tu cuenta" description="Regístrate y confirma tu correo para comenzar."><AuthForm mode="register" disabled={!isSupabaseConfigured()}/><p>¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link></p></AuthShell>; }
