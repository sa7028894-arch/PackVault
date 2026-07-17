import nodemailer from 'nodemailer';

type MailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpPort) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }
  return transporter;
}

export async function sendMail(opts: MailOptions) {
  // In production try to send via SMTP (if configured)
  const t = getTransporter();
  if (t) {
    return t.sendMail({ from: process.env.EMAIL_FROM || 'noreply@packvault.local', to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
  }

  // Dev-mode fallback: log to console and return a resolved promise
  // This keeps behavior predictable for local development when no SMTP is configured.
  console.info('Mail (dev-mode):', { to: opts.to, subject: opts.subject });
  if (opts.html) console.info('HTML:', opts.html);
  if (opts.text) console.info('Text:', opts.text);
  return Promise.resolve({ accepted: [opts.to] });
}
