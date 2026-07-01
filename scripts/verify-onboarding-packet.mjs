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

/** Merged packet: employment (1) + W-4 (5) + I-9 page 1 only (1) + WH-151 (2) = 9 pages. */
const EXPECTED_PACKET_PAGE_COUNT = 9;

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

let templatePageCount = 0;
let packetPageCount = 0;
for (const name of EMPLOYMENT_TEMPLATES) {
  const pages = await countPdfPages(path.join(docsDir, name));
  console.log(`${name}: ${pages} page(s)`);
}
templatePageCount += await countPdfPages(path.join(docsDir, EMPLOYMENT_TEMPLATES[0]));
packetPageCount += 1;
for (const name of PACKET_TEMPLATES) {
  const pages = await countPdfPages(path.join(docsDir, name));
  templatePageCount += pages;
  console.log(`${name}: ${pages} page(s)`);
  if (name === "i-9.pdf") {
    packetPageCount += 1;
  } else {
    packetPageCount += pages;
  }
}

if (packetPageCount !== EXPECTED_PACKET_PAGE_COUNT) {
  console.error(
    `Expected ${EXPECTED_PACKET_PAGE_COUNT} merged packet pages, got ${packetPageCount}`
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
  `verify-onboarding-packet passed (${packetPageCount} packet pages; ${templatePageCount} template pages).`
);
