# Migración a Next.js 15 para Vercel

Cambios aplicados:

- Next.js `15.5.24` (Maintenance LTS de seguridad, agosto 2026).
- React / React DOM 19.
- Node.js fijado a `22.x` mediante `engines.node`.
- `cookies()` migrado a uso async.
- `searchParams` de `/gracias` migrado a Promise async.
- `params` de la ruta dinámica de confirmación de transferencias migrado a Promise async.
- Eliminados los archivos `*-old` de la versión activa del proyecto.
- Eliminado `package-lock.json` antiguo para evitar arrastrar el árbol de Next 14; Vercel lo reconstruirá con `npm install`.

## Error que motivó el cambio

El deployment fallaba porque GitHub todavía contenía:

`src/app/api/flow/confirm/route-old.ts`

Ese archivo importaba `sendGuestAndOwnerEmails`, función que ya no existe en `src/lib/email.ts`. Aunque el archivo terminaba en `route-old.ts`, sigue siendo un `.ts` dentro de `src` y TypeScript lo incluía durante el chequeo del build.

La versión corregida no contiene ese archivo ni otros archivos legacy equivalentes.

## Antes de producción

Ejecutar en Neon / entorno con DATABASE_URL correcto:

`npm run db:push`

Y verificar las variables de Vercel necesarias para Flow, Neon, SMTP y ADMIN_PASSWORD.
