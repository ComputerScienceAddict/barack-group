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
import { i9RequiredRules } from "../src/lib/employee-onboarding/requiredFields";
import { w4EnglishRequiredRules } from "../src/lib/employee-onboarding/w4Fields";
import { wh151RequiredRules } from "../src/lib/employee-onboarding/requiredFields";
import type { FormValuesState } from "../src/lib/employee-onboarding/loadDraft";
import type { DirectDepositValues } from "../src/lib/employee-onboarding/directDeposit";
import { blockDrawnSignatureValue } from "./onboardingTestFixtures";

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

const DRAWN_SIGNATURE = blockDrawnSignatureValue();

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
    applicant_signature: DRAWN_SIGNATURE,
    applicant_signature_date: TODAY,
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
    employee_signature_step5: DRAWN_SIGNATURE,
    employee_date_step5: TODAY,
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
    "Signature of Employee": DRAWN_SIGNATURE,
    "Today's Date mmddyyy": TODAY,
  },
  wh151: {
    WorkerSignature: DRAWN_SIGNATURE,
    Text440: "John Doe",
    Text441: TODAY,
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
const subject = buildWorkDocumentsSubject({ applicantName: JOHN_DOE, state: "TX" });
const filename = buildWorkDocumentsFilename({ applicantName: JOHN_DOE, state: "TX" });
console.log(`Subject: ${subject}`);
console.log(`Attachment: ${filename}`);
assert(
  subject === "𝐓𝐞𝐱𝐚𝐬 — john-doe-workdocs",
  `Expected subject with bold Texas first, got ${subject}`
);
assert(filename === "texas-john-doe-workdocs.pdf", `Expected filename texas-john-doe-workdocs.pdf, got ${filename}`);

// 2. Validation — all forms complete
const rulesByForm = [
  ["employment", employmentEnglishRequiredRules, johnDoeFormValues.employment],
  ["w4", w4EnglishRequiredRules, johnDoeFormValues.w4],
  ["i9", i9RequiredRules, johnDoeFormValues.i9],
  ["wh151", wh151RequiredRules, johnDoeFormValues.wh151],
] as const;

for (const [name, rules, values] of rulesByForm) {
  const missing = getMissingFieldIssues(rules, values);
  assert(missing.length === 0, `${name} has ${missing.length} missing required field(s)`);
  console.log(`✓ ${name}: all required fields present`);
}

// 3. Build combined packet and verify fills saved
const packetResult = await buildSubmissionPacket(johnDoeFormValues, directDeposit, "en");
console.log(`\n✓ Packet built: ${packetResult.pageCount} pages`);

const formNames = ["employment", "w4", "i9", "wh151"] as const;
for (let i = 0; i < packetResult.formResults.length; i++) {
  const result = packetResult.formResults[i];
  const name = formNames[i];
  console.log(
    `  ${name}: filled ${result.filledCount} field(s), verified ${result.verifiedCount}, missing ${result.missingFields.length}`
  );
  assert(result.filledCount > 0, `${name} filledCount is 0 — edits not saved to PDF`);
}

assert(packetResult.pageCount === 9, `Expected 9 pages in packet, got ${packetResult.pageCount}`);

const totalFilled = packetResult.formResults.reduce((sum, r) => sum + r.filledCount, 0);
assert(totalFilled >= 50, `Expected at least 50 filled fields in packet, got ${totalFilled}`);

const totalSignatures = packetResult.formResults.reduce(
  (sum, r) => sum + (r.verifiedCount > 0 ? r.verifiedCount : 0),
  0
);
assert(totalSignatures >= 4, `Expected at least 4 drawn signatures verified, got ${totalSignatures}`);

const outPath = path.join(process.cwd(), "scripts", "john-doe-workdocs-test.pdf");
fs.writeFileSync(outPath, packetResult.pdfBytes);
console.log(`\n✓ Wrote test packet: ${outPath}`);

// 4. Send email
console.log("\nSending email to SMTP_TO recipients...");
await sendSubmissionEmail({
  applicantName: JOHN_DOE,
  state: "TX",
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
