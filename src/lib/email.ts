import nodemailer from 'nodemailer';
import { formatCLP } from './format';

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character] ?? character));
}

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

export async function sendEmail({ to, subject, html, text }: EmailInput) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Correo no enviado: faltan variables SMTP.');
    return false;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
    text
  });

  return true;
}

export async function sendGiftConfirmedEmails(input: {
  guestName: string;
  guestEmail: string;
  giftTitle: string;
  amount: number;
  message?: string | null;
  commerceOrder: string;
}) {
  const couple = process.env.COUPLE_NAMES ?? 'Cata & César';
  const ownerEmail = process.env.OWNER_EMAIL;
  const guestName = escapeHtml(input.guestName);
  const giftTitle = escapeHtml(input.giftTitle);
  const message = input.message ? escapeHtml(input.message).replace(/\n/g, '<br>') : '';

  await sendEmail({
    to: input.guestEmail,
    subject: `Gracias por tu regalo para ${couple}`,
    text: `¡Gracias, ${input.guestName}! Recibimos tu regalo simbólico: ${input.giftTitle} por ${formatCLP(input.amount)}. Gracias por acompañarnos en esta aventura.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.65;color:#14283B;max-width:620px;margin:auto;padding:30px;background:#F7F2E8;border-radius:20px">
        <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#A97928;font-weight:700">Cata &amp; César · 26.02.2027</div>
        <h1 style="font-family:Georgia,serif;color:#0A3456;font-size:36px;margin:14px 0">¡Gracias, ${guestName}!</h1>
        <p>Recibimos con mucho cariño tu regalo simbólico: <strong>${giftTitle}</strong>.</p>
        <p>Tu aporte de <strong>${formatCLP(input.amount)}</strong> será parte de un recuerdo muy especial de nuestra próxima aventura.</p>
        ${message ? `<p><strong>Tu mensaje:</strong><br>${message}</p>` : ''}
        <p>Gracias por acompañarnos en este momento tan importante.</p>
        <p style="font-family:Georgia,serif;font-size:22px;color:#0A3456">Con cariño,<br>${escapeHtml(couple)}</p>
      </div>
    `
  });

  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `Nuevo regalo confirmado: ${formatCLP(input.amount)}`,
      text: `Nuevo regalo confirmado. Invitado: ${input.guestName}. Regalo: ${input.giftTitle}. Monto: ${formatCLP(input.amount)}. Orden: ${input.commerceOrder}.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14283B">
          <h2 style="color:#0A3456">Nuevo regalo confirmado</h2>
          <p><strong>Invitado:</strong> ${guestName}</p>
          <p><strong>Correo:</strong> ${escapeHtml(input.guestEmail)}</p>
          <p><strong>Regalo:</strong> ${giftTitle}</p>
          <p><strong>Monto:</strong> ${formatCLP(input.amount)}</p>
          <p><strong>Orden:</strong> ${escapeHtml(input.commerceOrder)}</p>
          ${message ? `<p><strong>Mensaje:</strong><br>${message}</p>` : ''}
        </div>
      `
    });
  }
}

export async function sendTransferPendingEmails(input: {
  guestName: string;
  guestEmail: string;
  giftTitle: string;
  amount: number;
  commerceOrder: string;
}) {
  const couple = process.env.COUPLE_NAMES ?? 'Cata & César';
  const ownerEmail = process.env.OWNER_EMAIL;

  await sendEmail({
    to: input.guestEmail,
    subject: `Registramos tu regalo para ${couple}`,
    text: `Registramos tu regalo por transferencia: ${input.giftTitle} por ${formatCLP(input.amount)}. Quedará confirmado cuando verifiquemos el abono.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.65;color:#14283B;max-width:620px;margin:auto;padding:30px;background:#F7F2E8;border-radius:20px">
        <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#A97928;font-weight:700">Cata &amp; César</div>
        <h1 style="font-family:Georgia,serif;color:#0A3456">¡Gracias, ${escapeHtml(input.guestName)}!</h1>
        <p>Registramos tu regalo <strong>${escapeHtml(input.giftTitle)}</strong> por <strong>${formatCLP(input.amount)}</strong>.</p>
        <p>Por ahora aparecerá como pendiente y quedará confirmado cuando verifiquemos la transferencia.</p>
        <p>Con cariño,<br><strong>${escapeHtml(couple)}</strong></p>
      </div>
    `
  });

  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `Transferencia por verificar: ${formatCLP(input.amount)}`,
      text: `Hay un regalo por transferencia pendiente de verificar. Invitado: ${input.guestName}. Orden: ${input.commerceOrder}.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14283B">
          <h2 style="color:#0A3456">Transferencia pendiente de verificación</h2>
          <p><strong>Invitado:</strong> ${escapeHtml(input.guestName)}</p>
          <p><strong>Correo:</strong> ${escapeHtml(input.guestEmail)}</p>
          <p><strong>Regalo:</strong> ${escapeHtml(input.giftTitle)}</p>
          <p><strong>Monto:</strong> ${formatCLP(input.amount)}</p>
          <p><strong>Orden:</strong> ${escapeHtml(input.commerceOrder)}</p>
          <p>Revisa el abono en el banco antes de marcarlo como pagado en el panel.</p>
        </div>
      `
    });
  }
}
