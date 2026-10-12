import type { ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export default function AuthShell({title,description,children}: {title:string;description:string;children:ReactNode}) {
  return <section className="auth-card"><p className="eyebrow">SECURE AUTH</p><h1>{title}</h1><p className="muted">{description}</p>{!isSupabaseConfigured() && <p className="setup" role="status">Falta conectar Supabase. Configura las variables indicadas en el README para habilitar el acceso.</p>}{children}</section>;
}
