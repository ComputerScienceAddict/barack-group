import fs from "node:fs";
import path from "node:path";
import {
  buildWorkDocumentsFilename,
  buildWorkDocumentsSubject,
} from "../src/lib/employee-onboarding/applicantName";
import { buildSubmissionPacket } from "../src/lib/employee-onboarding/buildSubmissionPacket";
import { sendSubmissionEmail } from "../src/lib/employee-onboarding/sendSubmissionEmail";
import { employmentEnglishRequiredRules } from "../src/lib/employee-onboarding/employmentFields";
import { getMissingFieldIssues } from "../src/lib/employee-onboarding/fieldLabels";
import { w4RequiredRules, i9RequiredRules } from "../src/lib/employee-onboarding/requiredFields";
import { wh151RequiredRules } from "../src/lib/employee-onboarding/requiredFields";
import { wh153RequiredRules } from "../src/lib/employee-onboarding/wh153Fields";
import type { FormValuesState } from "../src/lib/employee-onboarding/loadDraft";
import type { DirectDepositValues } from "../src/lib/employee-onboarding/directDeposit";

function loadEnvFile(filePath: string) {
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

const JOHN_DOE = { firstName: "John", lastName: "Doe" };
const TODAY = "06/01/2026";

const johnDoeFormValues: FormValuesState = {
  employment: {
    date_of_application: TODAY,
    last_name: "Doe",
    first_name: "John",
    middle_initial: "Q",
    phone_number: "555-123-4567",
    ssn: "123-45-6789",
    address: "123 Main Street",
    city: "Detroit",
    state: "MI",
    zip_code: "48201",
    email_address: "john.doe@example.com",
    age_18_yes: true,
    position_full_time: true,
    shift_day: true,
    travel_yes: true,
    overtime_yes: true,
    authorized_yes: true,
    emergency_1_full_name: "Jane Doe",
    emergency_1_relationship: "Spouse",
    emergency_1_phone: "555-987-6543",
    emergency_1_alt_phone: "555-111-2222",
    emergency_2_full_name: "Jim Doe",
    emergency_2_relationship: "Brother",
    emergency_2_phone: "555-333-4444",
    emergency_2_alt_phone: "555-555-6666",
    applicant_signature: "John Doe",
    applicant_signature_date: TODAY,
    interviewed_by: "HR Rep",
    company_date: TODAY,
    position_offered: "Cleaner",
    start_date: TODAY,
    company_notes: "John Doe onboarding test",
  },
  w4: {
    "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": "John",
    "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": "Doe",
    "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": "123 Main Street",
    "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": "Detroit, MI 48201",
    "topmostSubform[0].Page1[0].f1_05[0]": "123-45-6789",
    "topmostSubform[0].Page1[0].c1_1[0]": true,
    "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]": "0",
    "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]": "0",
    "topmostSubform[0].Page1[0].f1_08[0]": "0",
    "topmostSubform[0].Page1[0].f1_13[0]": "John Doe",
    "topmostSubform[0].Page1[0].f1_14[0]": TODAY,
  },
  i9: {
    "Last Name (Family Name)": "Doe",
    "First Name Given Name": "John",
    "Address Street Number and Name": "123 Main Street",
    "City or Town": "Detroit",
    State: "MI",
    "ZIP Code": "48201",
    "Date of Birth mmddyyyy": "01/15/1990",
    "US Social Security Number": "123-45-6789",
    "Employees E-mail Address": "john.doe@example.com",
    "Telephone Number": "555-123-4567",
    CB_1: true,
    "Signature of Employee": "John Doe",
    "Today's Date mmddyyy": TODAY,
  },
  wh151: {
    Text440: "John Doe",
    Text441: TODAY,
  },
  wh153: {
    "nombre del empleado": "John Doe",
    "nombre del empleador": "Barak Group Inc.",
    fecha: TODAY,
    casilla: true,
    "Pago por Hora": "15.00",
    renglon: "Line 1 test",
  },
};

const directDeposit: DirectDepositValues = {
  wantsDirectDeposit: false,
  employeeName: "John Doe",
  bankName: "",
  routingNumber: "",
  accountNumber: "",
  confirmAccountNumber: "",
  accountType: "",
  authorization: false,
  signature: "",
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
}

async function main() {
console.log("=== John Doe E2E Test ===\n");

// 1. Email subject / filename
const subject = buildWorkDocumentsSubject(JOHN_DOE);
const filename = buildWorkDocumentsFilename(JOHN_DOE);
console.log(`Subject: ${subject}`);
console.log(`Attachment: ${filename}`);
assert(subject === "john-doe-workdocs", `Expected subject john-doe-workdocs, got ${subject}`);
assert(filename === "john-doe-workdocs.pdf", `Expected filename john-doe-workdocs.pdf, got ${filename}`);

// 2. Validation — all forms complete
const rulesByForm = [
  ["employment", employmentEnglishRequiredRules, johnDoeFormValues.employment],
  ["w4", w4RequiredRules, johnDoeFormValues.w4],
  ["i9", i9RequiredRules, johnDoeFormValues.i9],
  ["wh151", wh151RequiredRules, johnDoeFormValues.wh151],
  ["wh153", wh153RequiredRules, johnDoeFormValues.wh153],
] as const;

for (const [name, rules, values] of rulesByForm) {
  const missing = getMissingFieldIssues(rules, values);
  assert(missing.length === 0, `${name} has ${missing.length} missing required field(s)`);
  console.log(`✓ ${name}: all required fields present`);
}

// 3. Build combined packet and verify fills saved
const packetResult = await buildSubmissionPacket(johnDoeFormValues, directDeposit, "en");
console.log(`\n✓ Packet built: ${packetResult.pageCount} pages`);

const formNames = ["employment", "w4", "i9", "wh151", "wh153"] as const;
for (let i = 0; i < packetResult.formResults.length; i++) {
  const result = packetResult.formResults[i];
  const name = formNames[i];
  console.log(
    `  ${name}: filled ${result.filledCount} field(s), verified ${result.verifiedCount}, missing ${result.missingFields.length}`
  );
  assert(result.filledCount > 0, `${name} filledCount is 0 — edits not saved to PDF`);
}

assert(packetResult.pageCount >= 14, `Expected at least 14 pages, got ${packetResult.pageCount}`);

const totalVerified = packetResult.formResults.reduce((sum, r) => sum + r.verifiedCount, 0);
assert(totalVerified >= 60, `Expected at least 60 verified fields in packet, got ${totalVerified}`);

const outPath = path.join(process.cwd(), "scripts", "john-doe-workdocs-test.pdf");
fs.writeFileSync(outPath, packetResult.pdfBytes);
console.log(`\n✓ Wrote test packet: ${outPath}`);

// 4. Send email
console.log("\nSending email to SMTP_TO recipients...");
await sendSubmissionEmail({
  applicantName: JOHN_DOE,
  pdfBytes: Buffer.from(packetResult.pdfBytes),
  packetId: "NH-JOHNDOE",
});

console.log("\n=== ALL PASSED ===");
console.log(`Email sent with subject "${subject}" and attachment "${filename}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
