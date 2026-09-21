# Mesa de regalos - Cata & César (v2)

Versión rediseñada y endurecida de la mesa de regalos del matrimonio. Mantiene Next.js + Vercel + Neon + Flow, pero alinea la experiencia visual con la invitación tipo boarding pass y mejora el flujo de pagos, transferencias y administración.

## Stack

- Next.js 14.2.35 / React 18 / TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Neon)
- Flow API
- Nodemailer / SMTP
- Vercel

## Diseño

La interfaz usa la misma familia visual de la invitación: azul marino, dorado y papel crema; lenguaje de viaje, tarjeta de embarque, línea de vuelo y los conceptos “Nuestra aventura”, “Primera clase” y “Equipaje”.

## Configuración local

```bash
npm install
cp .env.example .env
# Completa las variables reales
npm run db:push
npm run dev
```

## Variables de entorno en Vercel

Configura como mínimo:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `OWNER_EMAIL`
- `FLOW_BASE_URL`
- `FLOW_API_KEY`
- `FLOW_SECRET_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Variables `TRANSFER_*`

No copies valores reales dentro de `.env.example`.

## Flujo de tarjeta

1. El invitado elige un regalo y entrega nombre/correo/mensaje.
2. `/api/checkout` toma el monto desde `src/config/gifts.ts`; el cliente no decide el monto.
3. El backend crea la orden en Flow y devuelve una URL validada de Flow.
4. Flow notifica por POST a `/api/flow/confirm` con un token.
5. El backend consulta `payment/getStatus` y solo marca `paid` si orden, monto y moneda son coherentes.
6. El invitado vuelve a `/gracias` sin exponer el token de Flow en la URL final.

## Flujo de transferencia

1. El invitado ve los datos bancarios y registra el regalo.
2. Queda como `transfer_pending`.
3. En `/admin`, después de revisar el abono en el banco, se usa **Confirmar transferencia**.
4. Recién entonces pasa a `paid` y se envía el correo de confirmación.

## Panel privado

Abre:

```text
/admin
```

Ya no se usa `/admin?password=...`. La clave se envía por POST y el navegador mantiene una cookie de sesión HttpOnly por 7 días.

El panel permite:

- revisar regalos y mensajes;
- ver totales y pendientes;
- conciliar transferencias;
- sincronizar pagos Flow pendientes;
- exportar CSV seguro para Excel.

## Antes de desplegar v2

1. **Rota las credenciales de Flow de la versión anterior.** Ver `SECURITY_REVIEW.md`.
2. Copia las variables correctas a Vercel.
3. Ejecuta contra Neon:

```bash
npm run db:push
```

4. Revisa los montos en `src/config/gifts.ts`. Los cuatro primeros montos de la versión recibida son muy bajos y podrían corresponder a pruebas; no fueron modificados automáticamente.
5. Prueba Flow sandbox y luego un pago real de monto bajo.
6. Verifica envío de correos y conciliación de transferencia.

## Comandos útiles

```bash
npm run dev
npm run typecheck
npm run build
npm run db:push
npm run db:studio
```
