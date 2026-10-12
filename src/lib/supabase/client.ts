'use client';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import type { Database } from './database.types';
// Solo datos públicos sujetos a RLS. La sesión autenticada nunca llega al SDK
// del navegador: usar Server Actions o /api/session para datos privados.
export function createPublicBrowserClient() {
  const {url, key} = supabaseConfig();
  return createClient<Database>(url, key, {
    auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
  });
}
