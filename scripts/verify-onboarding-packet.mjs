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
];

/** One employment form + W-4 (5) + I-9 (4) + WH-151 (2) = 12 pages per packet with English employment. */
const EXPECTED_FORM_PAGE_COUNT = 12;

async function countPdfPages(filePath) {
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
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
if (!onboardingAppSource.includes("formWh151") || !onboardingAppSource.includes("packetItemWh151")) {
  console.error("OnboardingApp.tsx is missing WH-151PS packet integration");
  process.exit(1);
}

console.log(
  `verify-onboarding-packet passed (${formPageCount} form pages).`
);
