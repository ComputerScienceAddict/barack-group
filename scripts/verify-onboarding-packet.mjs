import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";

const root = process.cwd();
const docsDir = path.join(root, "public", "documents");

const EMPLOYMENT_TEMPLATES = [
  "janiking-employment-application-english.pdf",
  "janiking-employment-application-spanish.pdf",
];

const PACKET_TEMPLATES = [
  "w-4.pdf",
  "i-9.pdf",
  "wh-151ps-2024.pdf",
  "wh-153s-2024.pdf",
];

/** One employment form + the shared forms in each submitted packet. */
const EXPECTED_FORM_PAGE_COUNT = 14;

async function countPdfPages(filePath) {
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function countWh153Fields(filePath) {
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getForm().getFields().length;
}

const missingTemplates = [...EMPLOYMENT_TEMPLATES, ...PACKET_TEMPLATES].filter(
  (name) => !fs.existsSync(path.join(docsDir, name))
);
if (missingTemplates.length) {
  console.error(`Missing PDF templates: ${missingTemplates.join(", ")}`);
  process.exit(1);
}

let formPageCount = 0;
for (const name of EMPLOYMENT_TEMPLATES) {
  const pages = await countPdfPages(path.join(docsDir, name));
  console.log(`${name}: ${pages} page(s)`);
}
formPageCount += await countPdfPages(path.join(docsDir, EMPLOYMENT_TEMPLATES[0]));
for (const name of PACKET_TEMPLATES) {
  const pages = await countPdfPages(path.join(docsDir, name));
  formPageCount += pages;
  console.log(`${name}: ${pages} page(s)`);
}

if (formPageCount !== EXPECTED_FORM_PAGE_COUNT) {
  console.error(
    `Expected ${EXPECTED_FORM_PAGE_COUNT} combined form pages, got ${formPageCount}`
  );
  process.exit(1);
}

const wh153Path = path.join(docsDir, "wh-153s-2024.pdf");
const wh153FieldCount = await countWh153Fields(wh153Path);
if (wh153FieldCount < 10) {
  console.error(`WH-153S PDF has too few fillable fields: ${wh153FieldCount}`);
  process.exit(1);
}

const pdfFormsSource = fs.readFileSync(
  path.join(root, "src/lib/employee-onboarding/pdfForms.ts"),
  "utf8"
);
if (!pdfFormsSource.includes("employmentEnglishFormConfig") || !pdfFormsSource.includes("employmentSpanishFormConfig")) {
  console.error("pdfForms.ts is missing locale-specific employment form configs");
  process.exit(1);
}

const onboardingAppSource = fs.readFileSync(
  path.join(root, "src/components/employee-onboarding/OnboardingApp.tsx"),
  "utf8"
);
if (!onboardingAppSource.includes("formWh153") || !onboardingAppSource.includes("packetItemWh153")) {
  console.error("OnboardingApp.tsx is missing WH-153S packet integration");
  process.exit(1);
}

console.log(
  `verify-onboarding-packet passed (${formPageCount} form pages, WH-153S has ${wh153FieldCount} fields).`
);
