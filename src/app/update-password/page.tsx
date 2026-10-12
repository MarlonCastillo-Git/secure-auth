import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { requireUser } from '@/lib/auth/session';
export const metadata = {title:'Cambiar contraseña',robots:{index:false,follow:false}};
export default async function Password() { await requireUser(); return <AuthShell title="Elige una nueva contraseña" description="Después del cambio, volverás a iniciar sesión."><AuthForm mode="password"/></AuthShell>; }
