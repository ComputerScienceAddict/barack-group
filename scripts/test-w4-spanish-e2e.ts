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

const APPLICANT = { firstName: "BLOCK", lastName: "SIG" };
const TODAY = "07/02/2026";
const FULL_NAME = "BLOCK SIG";

const DRAWN_SIGNATURE = blockDrawnSignatureValue();

const formValues: FormValuesState = {
  employment: {
    fecha_solicitud: TODAY,
    apellido: "SIG",
    nombre: "BLOCK",
    numero_telefono: "555-000-0101",
    ssn_1: "111",
    ssn_2: "11",
    ssn_3: "1111",
    direccion: "123 Calle Test",
    ciudad: "Detroit",
    estado: "MI",
    codigo_postal: "48201",
    correo_electronico: "block.sig@example.com",
    mayor_18_si: true,
    empleo_tiempo_completo: true,
    turno_dia: true,
    dispuesto_viajar_si: true,
    horas_extra_si: true,
    autorizado_trabajar_si: true,
    emergencia_nombre_1: "Contacto Uno",
    emergencia_relacion_1: "Amigo",
    emergencia_telefono_1: "555-000-0102",
    emergencia_telefono_alterno_1: "555-000-0103",
    emergencia_nombre_2: "Contacto Dos",
    emergencia_relacion_2: "Hermano",
    emergencia_telefono_2: "555-000-0104",
    emergencia_telefono_alterno_2: "555-000-0105",
    firma_solicitante: DRAWN_SIGNATURE,
    fecha_firma: TODAY,
    entrevistado_por: "HR Rep",
    fecha_entrevista: TODAY,
    puesto_ofrecido: "Cleaner",
    fecha_inicio: TODAY,
    notas: "Spanish W-4 block signature test",
  },
  w4: {
    "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": "BLOCK",
    "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": "SIG",
    "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]": "123 Calle Test",
    "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]": "Detroit, MI 48201",
    "topmostSubform[0].Page1[0].f1_05[0]": "111-11-1111",
    "topmostSubform[0].Page1[0].c1_1[0]": true,
    "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]": "0",
    "topmostSubform[0].Page1[0].f1_07[0]": "0",
    "topmostSubform[0].Page1[0].f1_08[0]": "0",
    employee_signature_step5_sp: DRAWN_SIGNATURE,
    employee_date_step5_sp: TODAY,
  },
  i9: {
    "Last Name (Family Name)": "SIG",
    "First Name Given Name": "BLOCK",
    "Address Street Number and Name": "123 Calle Test",
    "City or Town": "Detroit",
    State: "MI",
    "ZIP Code": "48201",
    "Date of Birth mmddyyyy": "01/01/1990",
    "US Social Security Number": "111-11-1111",
    "Employees E-mail Address": "block.sig@example.com",
    "Telephone Number": "555-000-0101",
    CB_1: true,
    "Signature of Employee": DRAWN_SIGNATURE,
    "Today's Date mmddyyy": TODAY,
  },
  wh151: {
    WorkerSignature: DRAWN_SIGNATURE,
    Text440: "BLOCK SIG",
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
  console.log("=== Spanish W-4 Block Signature E2E ===\n");

  const subject = buildWorkDocumentsSubject(APPLICANT);
  const filename = buildWorkDocumentsFilename(APPLICANT);
  console.log(`Subject: ${subject}`);
  console.log(`Attachment: ${filename}`);

  const packetResult = await buildSubmissionPacket(formValues, directDeposit, "es");
  console.log(`Packet built: ${packetResult.pageCount} pages`);

  for (let i = 0; i < packetResult.formResults.length; i++) {
    const result = packetResult.formResults[i];
    const names = ["employment", "w4", "i9", "wh151"] as const;
    console.log(
      `  ${names[i]}: filled ${result.filledCount} field(s), verified ${result.verifiedCount}`
    );
  }

  const outPath = path.join(process.cwd(), "scripts", "test-w4-spanish-workdocs-test.pdf");
  fs.writeFileSync(outPath, packetResult.pdfBytes);
  console.log(`\nWrote: ${outPath}`);

  console.log("\nSending email to SMTP_TO recipients...");
  await sendSubmissionEmail({
    applicantName: APPLICANT,
    pdfBytes: Buffer.from(packetResult.pdfBytes),
    packetId: "NH-BLOCKSIG-ES",
  });

  console.log("\n=== ALL PASSED ===");
  console.log(`Email sent with subject "${subject}" and attachment "${filename}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
