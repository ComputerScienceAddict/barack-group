import nodemailer from "nodemailer";

export type SendTextEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  fromName?: string;
};

function parseRecipientList(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_USER and SMTP_PASS.");
  }

  return { host, port, user, pass };
}

export async function sendTextEmail(input: SendTextEmailInput) {
  const { host, port, user, pass } = getSmtpConfig();
  const to = Array.isArray(input.to) ? input.to : parseRecipientList(input.to);

  if (to.length === 0) {
    throw new Error("At least one recipient email is required.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  });

  await transporter.verify();

  await transporter.sendMail({
    from: `"${input.fromName ?? "Barak Group"}" <${user}>`,
    to,
    replyTo: user,
    subject: input.subject,
    text: input.text,
  });
}
