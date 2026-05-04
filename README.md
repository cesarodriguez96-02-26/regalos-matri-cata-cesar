# Mesa de regalos - Catalina & César

Proyecto web simple, elegante y configurable para recibir regalos simbólicos de matrimonio con pago online por Flow, alternativa de transferencia, mensajes de invitados, correos automáticos y exportación CSV.

## 1. Qué incluye

- Landing page responsive para **Catalina & César**.
- Sección para fotos de la pareja.
- Listado configurable de regalos simbólicos.
- Checkout con tarjeta vía Flow.
- Opción secundaria de transferencia.
- Guardado en base de datos SQLite.
- Mensaje del invitado asociado al regalo.
- Correo automático al invitado cuando Flow confirma pago exitoso.
- Correo automático al dueño del sitio cuando Flow confirma pago exitoso.
- Panel privado `/admin` y descarga CSV compatible con Excel.

## 2. Tecnología usada

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Nodemailer
- Flow API REST

## 3. Por qué Flow

Para este caso conviene priorizar baja fricción de integración y costos razonables. Flow permite crear órdenes de pago por API, redirigir al invitado a un checkout seguro y recibir confirmación por webhook. Además, en Chile publica tarifas para tarjetas de débito, crédito y prepago desde 2,89% + IVA con abono al tercer día hábil, y alternativa de abono al día hábil siguiente con comisión mayor. Revisa siempre la tarifa vigente antes de contratar.

Alternativas:

- **Webpay Plus directo:** suele ser muy confiable y puede ser conveniente por costo, pero requiere más gestión con Transbank y una integración más técnica.
- **Mercado Pago Checkout Pro:** integración cómoda y dinero rápido, pero normalmente con comisión porcentual más alta.
- **Transferencia manual:** sin comisión de pasarela, pero requiere conciliación manual y no confirma pagos automáticamente.

## 4. Requisitos previos

Instala:

- Node.js 20 o superior
- Git, opcional
- Una cuenta Flow sandbox para probar
- Una cuenta Flow producción para cobrar de verdad
- Un correo SMTP para enviar notificaciones

## 5. Instalación local

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Abre:

```txt
http://localhost:3000
```

## 6. Configurar variables de entorno

Edita `.env`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
ADMIN_PASSWORD=elige-una-clave-segura
OWNER_EMAIL=tu-correo@ejemplo.cl
COUPLE_NAMES=Catalina & César
WEDDING_DATE=26 de febrero

FLOW_BASE_URL=https://sandbox.flow.cl/api
FLOW_API_KEY=tu_api_key_sandbox
FLOW_SECRET_KEY=tu_secret_key_sandbox

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-password-app
SMTP_FROM="Catalina & César" <tu-correo@gmail.com>
```

Para producción cambia:

```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio.cl
FLOW_BASE_URL=https://www.flow.cl/api
FLOW_API_KEY=tu_api_key_produccion
FLOW_SECRET_KEY=tu_secret_key_produccion
```

## 7. Configurar los regalos simbólicos

Edita este archivo:

```txt
src/config/gifts.ts
```

Ejemplo:

```ts
{ id: 'cena-romantica', title: 'Cena romántica', description: '...', amount: 55000, emoji: '🍝' }
```

Puedes cambiar títulos, montos, emojis y descripciones. Mantén `id` único.

## 8. Agregar fotos reales

Reemplaza los placeholders en:

```txt
public/photos/
```

Nombres sugeridos:

```txt
foto-1.jpg
foto-2.jpg
foto-3.jpg
```

Luego edita `src/app/page.tsx` para cambiar los bloques placeholder por imágenes reales usando `<img />` o `next/image`.

## 9. Cómo funciona el pago con Flow

1. El invitado selecciona un regalo.
2. Ingresa nombre, correo y mensaje.
3. Presiona pagar con tarjeta.
4. El backend crea una orden en Flow usando `/payment/create`.
5. El invitado es redirigido al checkout de Flow.
6. Flow avisa al sitio en `/api/flow/confirm`.
7. El sitio consulta `/payment/getStatus`.
8. Si el estado es pagado, se marca como `paid`, se guarda la fecha de pago y se envían correos.

## 10. Importante para probar webhooks en local

Flow necesita llamar a una URL pública. En local puedes usar ngrok:

```bash
ngrok http 3000
```

Luego actualiza `.env`:

```env
NEXT_PUBLIC_SITE_URL=https://tu-url-ngrok.ngrok-free.app
```

Reinicia el servidor:

```bash
npm run dev
```

## 11. Panel privado y exportación Excel

Ingresa a:

```txt
/admin?password=TU_ADMIN_PASSWORD
```

Desde ahí puedes descargar CSV. Excel lo abre sin problema.

Endpoint directo:

```txt
/api/admin/export?password=TU_ADMIN_PASSWORD
```

## 12. Pasar a producción en Vercel

1. Crea cuenta en Vercel.
2. Sube el proyecto a GitHub.
3. Importa el repositorio en Vercel.
4. Agrega todas las variables de entorno en Project Settings > Environment Variables.
5. Configura dominio propio.
6. En Flow producción, configura y prueba las credenciales.
7. Cambia `FLOW_BASE_URL` a `https://www.flow.cl/api`.
8. Asegúrate de que `NEXT_PUBLIC_SITE_URL` sea tu dominio final.

## 13. Recomendación importante sobre base de datos

SQLite funciona perfecto para pruebas y un matrimonio pequeño, pero en Vercel el filesystem no es persistente. Para producción recomiendo una de estas opciones:

- **Neon Postgres**: recomendado.
- **Supabase Postgres**: recomendado si quieres ver datos en panel visual.
- **Turso SQLite**: opción liviana.

Si usas Postgres, cambia `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Y configura `DATABASE_URL` con la URL de tu proveedor.

## 14. Mejoras recomendadas antes de publicar

- Crear una página de términos breves: “los aportes son regalos voluntarios”.
- Agregar reCAPTCHA o Turnstile si se comparte públicamente.
- Mejorar el panel admin con login real.
- Agregar campo “teléfono” opcional.
- Agregar comprobante manual para transferencia.
- Usar Postgres en producción.
- Comprar dominio corto y elegante, por ejemplo `catalinaycesar.cl` si está disponible.
- Usar fotos reales y optimizadas en formato `.webp`.

## 15. Seguridad mínima

- Nunca subas `.env` a GitHub.
- Cambia `ADMIN_PASSWORD` por una clave larga.
- Usa claves de sandbox para pruebas y producción solo al publicar.
- Verifica siempre el estado del pago consultando a Flow, no confíes solo en el retorno visual del usuario.

## 16. Checklist final

- [ ] Editar nombres completos si corresponde.
- [ ] Cargar fotos reales.
- [ ] Editar regalos y montos.
- [ ] Configurar cuenta Flow sandbox.
- [ ] Probar pago sandbox.
- [ ] Configurar SMTP.
- [ ] Verificar correo al invitado.
- [ ] Verificar correo al dueño.
- [ ] Configurar base de datos persistente para producción.
- [ ] Publicar en Vercel.
- [ ] Probar con un aporte bajo antes de compartir invitación.
