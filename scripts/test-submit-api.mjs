import fs from "node:fs";
import path from "node:path";

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

const baseUrl = process.env.ONBOARDING_TEST_URL ?? "http://localhost:3000";
const TODAY = "06/01/2026";

const payload = {
  firstName: "John",
  lastName: "Doe",
  state: "MI",
  packetId: "NH-JOHNDOE",
  locale: "en",
  formValues: {
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
      employee_signature_step5: "John Doe",
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
      "Signature of Employee": "John Doe",
      "Today's Date mmddyyy": TODAY,
    },
    wh151: {
      WorkerSignature: "John Doe",
      Text440: "John Doe",
      Text441: TODAY,
    },
  },
  directDepositValues: { wantsDirectDeposit: false },
};

const response = await fetch(`${baseUrl}/api/onboarding/submit`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(`Submit API failed (${response.status}):`, body.error ?? body);
  process.exit(1);
}

console.log("Submit API test passed for John Doe.");
console.log("Expected email subject: 𝐌𝐢𝐜𝐡𝐢𝐠𝐚𝐧 — john-doe-workdocs");
console.log("Expected attachment: michigan-john-doe-workdocs.pdf");
console.log("Email should be delivered to SMTP_TO recipients.");
