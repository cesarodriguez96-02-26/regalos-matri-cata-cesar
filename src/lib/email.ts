import nodemailer from 'nodemailer';
import { formatCLP } from './format';

type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendEmail({ to, subject, html }: EmailInput) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Correo no enviado: faltan variables SMTP.');
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html
  });
}

export async function sendGuestAndOwnerEmails(input: {
  guestName: string;
  guestEmail: string;
  giftTitle: string;
  amount: number;
  message?: string | null;
  commerceOrder: string;
}) {
  const couple = process.env.COUPLE_NAMES ?? 'Catalina & César';
  const ownerEmail = process.env.OWNER_EMAIL;

  await sendEmail({
    to: input.guestEmail,
    subject: `Gracias por tu regalo para ${couple}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2D2626;max-width:620px;margin:auto;padding:24px;background:#F9F4ED;border-radius:18px">
        <h1 style="font-family:Georgia,serif;color:#7B3143">¡Gracias, ${input.guestName}!</h1>
        <p>Recibimos con mucho cariño tu regalo simbólico: <strong>${input.giftTitle}</strong>.</p>
        <p>Tu aporte de <strong>${formatCLP(input.amount)}</strong> será parte de un recuerdo muy especial para nosotros.</p>
        ${input.message ? `<p><strong>Tu mensaje:</strong><br>${input.message}</p>` : ''}
        <p>Gracias por acompañarnos en este momento tan importante.</p>
        <p style="font-family:Georgia,serif;font-size:20px;color:#7B3143">Con cariño,<br>${couple}</p>
      </div>
    `
  });

  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `Nuevo regalo recibido: ${formatCLP(input.amount)}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2D2626">
          <h2>Nuevo regalo confirmado</h2>
          <p><strong>Invitado:</strong> ${input.guestName}</p>
          <p><strong>Correo:</strong> ${input.guestEmail}</p>
          <p><strong>Regalo:</strong> ${input.giftTitle}</p>
          <p><strong>Monto:</strong> ${formatCLP(input.amount)}</p>
          <p><strong>Orden:</strong> ${input.commerceOrder}</p>
          ${input.message ? `<p><strong>Mensaje:</strong><br>${input.message}</p>` : ''}
        </div>
      `
    });
  }
}
