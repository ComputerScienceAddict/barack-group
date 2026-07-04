import fs from "node:fs";
import path from "node:path";
import {
  buildWorkDocumentsFilename,
  buildWorkDocumentsSubject,
} from "../src/lib/employee-onboarding/applicantName";
import { buildSubmissionPacket } from "../src/lib/employee-onboarding/buildSubmissionPacket";
import { sendSubmissionEmail } from "../src/lib/employee-onboarding/sendSubmissionEmail";
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

const APPLICANT = { firstName: "TEST", lastName: "TEST" };
const TODAY = "07/01/2026";
const FULL_NAME = "TEST TEST";

const DRAWN_SIGNATURE = blockDrawnSignatureValue();

const formValues: FormValuesState = {
  employment: {
    date_of_application: TODAY,
    last_name: "TEST",
    first_name: "TEST",
    phone_number: "555-000-0001",
    ssn: "111-11-1111",
    address: "123 Test Street",
    city: "Detroit",
    state: "MI",
    zip_code: "48201",
    email_address: "test.test@example.com",
    age_18_yes: true,
    position_full_time: true,
    shift_day: true,
    travel_yes: true,
    overtime_yes: true,
    authorized_yes: true,
    emergency_1_full_name: "Emergency Contact",
    emergency_1_relationship: "Friend",
    emergency_1_phone: "555-000-0002",
    emergency_1_alt_phone: "555-000-0003",
    emergency_2_full_name: "Backup Contact",
    emergency_2_relationship: "Sibling",
    emergency_2_phone: "555-000-0004",
    emergency_2_alt_phone: "555-000-0005",
    applicant_signature: DRAWN_SIGNATURE,
    applicant_signature_date: TODAY,
  },
  w4: {
    "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": "TEST",
    "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": "TEST",
    "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": "123 Test Street",
    "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": "Detroit, MI 48201",
    "topmostSubform[0].Page1[0].f1_05[0]": "111-11-1111",
    "topmostSubform[0].Page1[0].c1_1[0]": true,
    "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]": "0",
    "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]": "0",
    "topmostSubform[0].Page1[0].f1_08[0]": "0",
    employee_signature_step5: DRAWN_SIGNATURE,
    employee_date_step5: TODAY,
  },
  i9: {
    "Last Name (Family Name)": "TEST",
    "First Name Given Name": "TEST",
    "Address Street Number and Name": "123 Test Street",
    "City or Town": "Detroit",
    State: "MI",
    "ZIP Code": "48201",
    "Date of Birth mmddyyyy": "01/01/1990",
    "US Social Security Number": "111-11-1111",
    "Employees E-mail Address": "test.test@example.com",
    "Telephone Number": "555-000-0001",
    CB_1: true,
    "Signature of Employee": DRAWN_SIGNATURE,
    "Today's Date mmddyyy": TODAY,
  },
  wh151: {
    WorkerSignature: DRAWN_SIGNATURE,
    Text440: "TEST TEST",
    Text441: TODAY,
  },
};

const directDeposit: DirectDepositValues = {
  wantsDirectDeposit: false,
  employeeName: FULL_NAME,
  bankName: "",
  routingNumber: "",
  accountNumber: "",
  confirmAccountNumber: "",
  accountType: "",
  authorization: false,
  signature: "",
};

async function main() {
  const subject = buildWorkDocumentsSubject(APPLICANT);
  const filename = buildWorkDocumentsFilename(APPLICANT);
  console.log(`Subject: ${subject}`);
  console.log(`Attachment: ${filename}`);

  const packetResult = await buildSubmissionPacket(formValues, directDeposit, "en");
  console.log(`Packet built: ${packetResult.pageCount} pages`);

  const outPath = path.join(process.cwd(), "scripts", "test-test-workdocs-test.pdf");
  fs.writeFileSync(outPath, packetResult.pdfBytes);
  console.log(`Wrote: ${outPath}`);

  await sendSubmissionEmail({
    applicantName: APPLICANT,
    pdfBytes: Buffer.from(packetResult.pdfBytes),
    packetId: "NH-TESTTEST",
  });

  console.log("Email sent successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
