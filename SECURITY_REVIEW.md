# Revisión de seguridad - Mesa de regalos Cata & César

## Prioridad crítica

1. **Rotar las credenciales de Flow antes de volver a publicar.** El archivo `.env.example` de la versión recibida contenía valores que parecían credenciales reales. Esta versión los reemplaza por placeholders, pero si esas credenciales llegaron a GitHub, a un ZIP compartido o a un historial de Git, deben considerarse expuestas.
2. **Revisar el historial de Git.** Quitar un secreto del último commit no lo elimina de commits anteriores. Luego de rotar las claves, elimina los secretos del historial si el repositorio fue compartido o público.
3. **No volver a colocar datos sensibles en `.env.example`.** Los datos reales deben existir solo como variables de entorno locales/Vercel.

## Cambios de seguridad incluidos en v2

- Panel `/admin` con sesión en cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`; se eliminó la contraseña en query string.
- Exportación CSV y sincronización de Flow protegidas por la sesión del panel.
- La sincronización que modifica estado usa `POST`, no `GET`.
- Se evita propagar el token de Flow a `/gracias`.
- Se valida que URL base y URL de pago pertenezcan a dominios HTTPS de Flow.
- Se verifica que monto y moneda informados por Flow coincidan antes de marcar una orden como pagada.
- Se minimiza el `rawPaymentData`: ya no se guarda todo el payload de Flow.
- Confirmación idempotente para reducir correos duplicados ante callbacks concurrentes.
- Contenido aportado por invitados se escapa antes de insertarlo en correos HTML.
- Export CSV protegido contra fórmulas de Excel (`=`, `+`, `-`, `@`).
- Honeypot + tiempo mínimo de formulario para reducir bots triviales.
- Cabeceras HTTP de seguridad básicas y `poweredByHeader` desactivado.
- Página marcada `noindex` para reducir exposición accidental de un sitio pensado para invitados.
- Se agregó conciliación manual segura de transferencias desde el panel.

## Recomendaciones antes de producción

- Usa una `ADMIN_PASSWORD` única de 24+ caracteres.
- En Neon usa la cadena de conexión con pooling recomendada para entornos serverless.
- Ejecuta `npm run db:push` después de configurar `DATABASE_URL`, porque v2 agrega `notificationSentAt` e índices.
- Haz una compra real de monto bajo en Flow producción antes de enviar la invitación.
- Considera Cloudflare Turnstile si el enlace se hace público fuera del círculo de invitados.
- Activa 2FA en GitHub, Vercel, Neon, Flow y la cuenta usada para SMTP.
