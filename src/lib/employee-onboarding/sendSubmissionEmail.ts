import nodemailer from "nodemailer";
import {
  buildWorkDocumentsFilename,
  buildWorkDocumentsSubject,
  normalizeApplicantName,
  type ApplicantName,
} from "@/lib/employee-onboarding/applicantName";

export type SendSubmissionEmailInput = {
  applicantName: ApplicantName;
  /** Applying-from office state (OR / UT / ID / TX) — used in the email subject. */
  state?: string | null;
  pdfBytes: Buffer;
  packetId?: string;
};

function parseRecipientList(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const toRaw = process.env.SMTP_TO;

  if (!user || !pass || !toRaw) {
    throw new Error("SMTP is not configured. Set SMTP_USER, SMTP_PASS, and SMTP_TO.");
  }

  const to = parseRecipientList(toRaw);
  if (to.length === 0) {
    throw new Error("SMTP_TO must include at least one recipient email.");
  }

  return { host, port, user, pass, to };
}

export async function sendSubmissionEmail(input: SendSubmissionEmailInput) {
  const applicantName = normalizeApplicantName(input.applicantName);
  const label = { applicantName, state: input.state };
  const { host, port, user, pass, to } = getSmtpConfig();
  const subject = buildWorkDocumentsSubject(label);
  const filename = buildWorkDocumentsFilename(label);

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
    from: `"Barak Group Onboarding" <${user}>`,
    to,
    replyTo: user,
    subject,
    text: "",
    attachments: [
      {
        filename,
        content: input.pdfBytes,
        contentType: "application/pdf",
      },
    ],
  });
}
