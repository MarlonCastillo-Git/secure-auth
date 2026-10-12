# Secure Auth

Aplicación Next.js 16 (App Router), React y TypeScript con registro, inicio y cierre de sesión, confirmación por correo, recuperación de contraseña y dashboard privado. Supabase administra las credenciales; la aplicación valida formularios con Zod y ejecuta la autenticación mediante Server Actions.

## Instalación local

Requisitos: Node.js 22 LTS y pnpm (el proyecto declara la versión en `packageManager`).

```bash
cd /Users/marloncastillo/secure-auth
pnpm install
# Solo si no existe todavía .env.local:
cp .env.example .env.local
pnpm dev --port 3040
```

Abre http://localhost:3040. La configuración local preparada utiliza ese origen. Si eliges otro puerto, cambia también `SITE_URL` y las URLs permitidas en Supabase. No alternes entre localhost y 127.0.0.1: son orígenes y cookies diferentes.

## Variables de entorno

`.env.local` está excluido de Git. `.env.example` contiene únicamente ejemplos.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del mismo proyecto; no es una clave administrativa. |
| `SITE_URL` | Origen exacto, sin rutas: `http://localhost:3040` en desarrollo y `https://tu-dominio` en producción. |

Proyecto seleccionado: **portalcripto**, referencia `nxxusbeatfjnlwyjifyc`. No utilizar `service_role` ni claves secretas en variables `NEXT_PUBLIC_*`. Las variables públicas se incluyen en el bundle durante la compilación; vuelve a compilar si cambian.

## Configuración pendiente en Supabase

La conexión pública y el proveedor de correo fueron comprobados; la confirmación por correo está habilitada. El panel requiere iniciar sesión y la migración no se ha ejecutado desde esta tarea.

1. Abre el proyecto portalcripto en Supabase. Revisa si ya existe una tabla `public.profiles` u otros triggers sobre `auth.users`; al compartir proyecto, verifica compatibilidad antes de aplicar una migración.
2. Ejecuta **una vez**, desde SQL Editor, `supabase/migrations/202610080001_profiles.sql`. Crea perfiles, políticas RLS que limitan lectura y modificación al propietario, un trigger para nuevos usuarios y perfiles para cuentas existentes. No modifica las tablas categorias o criptomonedas. Las políticas y el trigger no están diseñados para ejecutarse repetidamente.
3. En Authentication → URL Configuration, configura el Site URL de tu aplicación y agrega estas Redirect URLs exactas:
   - `http://localhost:3040/auth/callback`
   - `http://localhost:3040/auth/callback?next=/update-password`
   - Los equivalentes HTTPS de producción.
4. Como portalcripto es un proyecto compartido, conserva las URLs necesarias para las otras aplicaciones. Revisa el impacto antes de cambiar su Site URL global.
5. Mantén el proveedor Email habilitado y la confirmación de correo activada. Las plantillas deben conservar el enlace de confirmación estándar de Supabase (`{{ .ConfirmationURL }}`), que devuelve un código PKCE al callback. Abre los enlaces de registro y recuperación en el mismo navegador donde solicitaste el correo.
6. Para producción configura SMTP y revisa los límites de envío, límites de autenticación y política de contraseñas del proyecto. La aplicación requiere contraseñas nuevas de 12 a 128 caracteres. No incluye un limitador distribuido propio; depende de los límites de Supabase.

Si la tabla aún no existe, el dashboard muestra los datos de Auth y un aviso para completar la configuración de perfiles. No se oculta el problema de base de datos.

## Uso

- `/register`: crea una cuenta y solicita confirmación de correo.
- `/login`: inicia sesión con correo y contraseña.
- `/forgot-password`: solicita un enlace de recuperación.
- `/auth/callback`: intercambia el código PKCE; solo permite los destinos internos dashboard o actualización de contraseña.
- `/update-password`: requiere sesión válida; después del cambio intenta cerrar las sesiones de Supabase y devuelve al login.
- `/dashboard`: muestra el usuario verificado y su perfil privado.
- El botón de cierre de sesión ejecuta una Server Action mediante POST.
- `/api/session`: devuelve únicamente id y correo del usuario verificado, o 401; nunca devuelve tokens.

## Arquitectura y seguridad

| Archivo/directorio | Responsabilidad |
| --- | --- |
| `src/app/actions.ts` | Registro, login, logout, recuperación y cambio de contraseña. |
| `src/lib/auth/validation.ts` | Esquemas compartidos de validación cliente/servidor. |
| `src/lib/auth/security.ts` | Origen permitido y validación CSRF en acciones. |
| `src/lib/auth/session.ts` | Consulta verificada de usuario y guardas del servidor. |
| `src/lib/supabase/server.ts` | Cliente SSR, lectura y escritura de cookies en acciones y handlers. |
| `src/lib/supabase/client.ts` | Cliente de navegador exclusivamente público/anónimo. |
| `src/lib/supabase/proxy.ts` | Refresco, cookies y redirecciones según sesión. |
| `src/lib/supabase/database.types.ts` | Tipos del esquema de perfiles. |
| `src/proxy.ts` | Middleware de Next.js 16: protección, CSP y cabeceras. |
| `src/components/` | Formularios con validación, estados pendientes y mensajes accesibles. |
| `src/app/layout.tsx` | Navegación condicional y renderizado dinámico. |
| `supabase/migrations/` | Tabla, trigger y políticas RLS. |

Next.js 16 utiliza `proxy.ts` como convención actual del middleware. El proxy comprueba la sesión con `getUser()` y conserva las cookies de refresco incluso al redirigir. Las páginas privadas y las acciones vuelven a comprobar la identidad; las políticas RLS protegen los datos en Supabase.

Las cookies de autenticación creadas por `@supabase/ssr` usan **httpOnly**, **sameSite=lax**, **path=/** y **secure en producción**. Desarrollo permite HTTP local; producción exige HTTPS. Ni access tokens ni refresh tokens se guardan en localStorage o se entregan a Client Components.

Por este requisito de httpOnly, el cliente de navegador NO usa autenticación directa: desactiva persistencia, refresco automático y detección de sesión en URL. Sirve para datos públicos con RLS. Los componentes cliente llaman a Server Actions para autenticarse, y deben usar acciones/handlers del servidor para datos privados. No reemplazarlo por un cliente de navegador que lea o escriba cookies de sesión.

CSRF: el proxy rechaza mutaciones con Origin distinto de SITE_URL (incluido un Origin ausente), las acciones repiten la validación y Next.js conserva su comprobación integrada. El callback GET usa PKCE y destinos permitidos; no acepta redirecciones externas.

XSS: React escapa el texto, no se inserta HTML del usuario y se genera una CSP con nonce por petición. `unsafe-eval` solo se permite en desarrollo. httpOnly evita leer los tokens desde JavaScript, pero no elimina por sí solo todos los efectos de XSS.

La aplicación devuelve `Cache-Control: private, no-store` y renderiza las páginas dinámicamente para evitar compartir datos o nonces entre usuarios. Cache Components y partial prefetching se desactivaron en la configuración. No aplicar caché pública a respuestas con sesiones.

Las respuestas de registro/recuperación son deliberadamente neutras para no confirmar si un correo está registrado. Los errores inesperados no exponen detalles internos. Se incluyen metadatos, títulos y reglas robots/noindex para pantallas privadas; estas reglas no reemplazan la autorización.

## Validación y despliegue

```bash
pnpm lint
pnpm build
# En producción, configurar SITE_URL HTTPS y servir detrás de HTTPS:
pnpm start --port 3040
```

Comprobado: ESLint, compilación TypeScript/Next.js, redirección anónima de dashboard y cambio de contraseña, API de sesión 401, rechazo CSRF 403 y coherencia nonce CSP/HTML con no-store. No se han completado registro, correo, recuperación o login real de extremo a extremo: requieren la configuración del panel y una cuenta de prueba.

En este entorno automatizado `pnpm dev` encontró un error de macOS/Turbopack `unable to start FSEvent stream`; la compilación y `pnpm start` sí funcionaron. Si ocurre también en tu terminal, reinicia el servidor desde una terminal local con acceso al directorio del proyecto. No confundir ese fallo del observador de archivos con un fallo de compilación.

Después de configurar Supabase, verifica con dos cuentas de prueba: registro y confirmación, login correcto/incorrecto, recuperación en el mismo navegador, logout, expiración/refresco y aislamiento RLS entre usuarios. Comprueba en DevTools que las cookies de sesión tengan httpOnly y, bajo HTTPS de producción, secure; no copies sus valores a reportes.

Referencias: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [consideraciones de autenticación SSR](https://supabase.com/docs/guides/auth/server-side/advanced-guide), [Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
