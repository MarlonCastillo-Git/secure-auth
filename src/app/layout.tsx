import type { Metadata } from 'next';
import Link from 'next/link';
import { getUser } from '@/lib/auth/session';
import SignOut from '@/components/SignOut';
import './globals.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:{default:'Secure Auth | Tu acceso seguro',template:'%s | Secure Auth'},description:'Un espacio personal con autenticación segura y protección de tu información.'};
export default async function Layout({children}: {children:React.ReactNode}) {
  const user=await getUser();
  return <html lang="es"><body><header><Link className="brand" href="/">◈ Secure<span>Auth</span></Link><nav aria-label="Navegación principal">{user ? <><Link href="/dashboard">Mi cuenta</Link><SignOut/></> : <><Link href="/login">Iniciar sesión</Link><Link className="button secondary" href="/register">Crear cuenta</Link></>}</nav></header><main>{children}</main><footer>Tu privacidad, desde el primer acceso.</footer></body></html>;
}
