import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cookieOptions, supabaseConfig } from './config';
import type { Database } from './database.types';

// readOnly es exclusivo de Server Components; acciones y handlers propagan
// fallos de escritura de cookies en lugar de ocultarlos.
export async function createServerSupabase(readOnly = false) {
  const store = await cookies();
  const {url, key} = supabaseConfig();
  return createServerClient<Database>(url, key, {
    cookieOptions,
    cookies: {
      getAll: () => store.getAll(),
      setAll: (items) => {
        if (readOnly) return; // Proxy ya refrescó la sesión antes del render.
        items.forEach(({name, value, options}) => store.set(name, value, {...options, ...cookieOptions}));
      },
    },
  });
}
