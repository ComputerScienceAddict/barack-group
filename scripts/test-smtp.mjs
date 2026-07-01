import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT ?? "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
const toRaw = process.env.SMTP_TO;

if (!user || !pass || !toRaw) {
  console.error("Missing SMTP_USER, SMTP_PASS, or SMTP_TO in .env.local");
  process.exit(1);
}

const to = toRaw
  .split(/[,;]/)
  .map((entry) => entry.trim())
  .filter(Boolean);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log("SMTP verify: OK");
} catch (error) {
  console.error("SMTP verify failed:", error);
  process.exit(1);
}

const pdfPath = path.join(process.cwd(), "public/documents/w-4.pdf");
const pdfBytes = fs.readFileSync(pdfPath);

try {
  await transporter.sendMail({
    from: `"Barak Group Onboarding" <${user}>`,
    to,
    subject: "test-user-workdocs.pdf",
    text: "",
    attachments: [
      {
        filename: "test-user-workdocs.pdf",
        content: pdfBytes,
        contentType: "application/pdf",
      },
    ],
  });
  console.log(`SMTP send: OK (${to.length} recipient(s))`);
} catch (error) {
  console.error("SMTP send failed:", error);
  process.exit(1);
}
