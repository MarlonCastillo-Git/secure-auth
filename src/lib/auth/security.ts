import 'server-only';
import { headers } from 'next/headers';
export function siteOrigin() {
  const value = process.env.SITE_URL;
  if (!value) throw new Error('Falta configurar SITE_URL.');
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL debe ser un origen sin ruta.');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Producción requiere HTTPS.');
  if (!['http:','https:'].includes(url.protocol)) throw new Error('Protocolo no permitido.');
  return url.origin;
}
export async function assertSameOrigin() {
  const h = await headers();
  if (h.get('origin') !== siteOrigin()) throw new Error('Origen de solicitud no permitido.');
  const site = h.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') throw new Error('Solicitud entre sitios no permitida.');
}
