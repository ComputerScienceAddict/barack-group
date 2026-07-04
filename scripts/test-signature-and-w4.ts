import fs from "node:fs";
import path from "node:path";
import { PDFDict, PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { fillPdf, verifyFilledPdf } from "../src/lib/employee-onboarding/fillPdf";
import { getMissingFieldIssues } from "../src/lib/employee-onboarding/fieldLabels";
import {
  decodeDrawnSignature,
  encodeDrawnSignature,
  isPdfSignatureField,
  PDF_SIGNATURE_FIELD_NAMES,
} from "../src/lib/employee-onboarding/signatureFields";
import { mirrorW4FieldValues, w4EnglishRequiredRules, w4SpanishRequiredRules } from "../src/lib/employee-onboarding/w4Fields";
import { blockDrawnSignatureValue, BLOCK_SIGNATURE_DATA_URL } from "./onboardingTestFixtures";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
}

function testEncodeDecodeRoundTrip() {
  const encoded = encodeDrawnSignature(BLOCK_SIGNATURE_DATA_URL);
  const decoded = decodeDrawnSignature(encoded);
  assert(decoded === BLOCK_SIGNATURE_DATA_URL, "encode/decode round trip failed");
  assert(decodeDrawnSignature("plain text") === null, "plain text should not decode as signature");
  assert(decodeDrawnSignature("") === null, "empty string should not decode as signature");
  console.log("✓ encode/decode round trip");
}

function testSignatureFieldRegistry() {
  const expected = [
    "employee_signature_step5",
    "employee_signature_step5_sp",
    "applicant_signature",
    "firma_solicitante",
    "Signature of Employee",
    "WorkerSignature",
  ];
  for (const name of expected) {
    assert(PDF_SIGNATURE_FIELD_NAMES.has(name), `missing signature field registration: ${name}`);
    assert(isPdfSignatureField(name), `isPdfSignatureField should be true for ${name}`);
  }
  assert(!isPdfSignatureField("employee_date_step5"), "date field must not be treated as signature");
  console.log("✓ signature field registry");
}

function testW4MirrorClearBehavior() {
  const drawn = blockDrawnSignatureValue();
  const today = "07/02/2026";

  const cleared = mirrorW4FieldValues(
    {
      employee_signature_step5: "",
      employee_signature_step5_sp: drawn,
      employee_date_step5: today,
      employee_date_step5_sp: "01/01/2020",
    },
    "en"
  );
  assert(cleared.employee_signature_step5_sp === "", "clearing EN signature must clear ES mirror");
  assert(cleared.employee_date_step5_sp === today, "clearing signature must not break date mirror");

  const restored = mirrorW4FieldValues(
    {
      employee_signature_step5: drawn,
      employee_date_step5: today,
    },
    "en"
  );
  assert(restored.employee_signature_step5_sp === drawn, "EN signature must mirror to ES");
  assert(restored.employee_date_step5_sp === today, "EN date must mirror to ES");
  console.log("✓ W-4 mirror clear + sync behavior");
}

function testDrawnSignatureValidation() {
  const drawn = blockDrawnSignatureValue();
  const today = "07/02/2026";
  const values = {
    "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": "Jane",
    "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": "Smith",
    "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": "123 Main St",
    "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": "Detroit, MI",
    "topmostSubform[0].Page1[0].f1_05[0]": "123-45-6789",
    "topmostSubform[0].Page1[0].c1_1[0]": true,
    employee_signature_step5: drawn,
    employee_date_step5: today,
  };

  const missing = getMissingFieldIssues(w4EnglishRequiredRules, values);
  assert(missing.length === 0, `drawn W-4 signature should satisfy validation (${missing.length} missing)`);
  console.log("✓ drawn signature satisfies W-4 validation");
}

function countPageImageXObjects(doc: PDFDocument, pageIndex: number) {
  const page = doc.getPage(pageIndex);
  const resources = page.node.Resources();
  if (!resources) return 0;

  const xObject = resources.lookup(PDFName.of("XObject"));
  if (!(xObject instanceof PDFDict)) return 0;

  let count = 0;
  for (const [, value] of xObject.entries()) {
    const stream = doc.context.lookup(value);
    if (stream instanceof PDFRawStream) {
      const subtype = stream.dict.lookup(PDFName.of("Subtype"));
      if (subtype === PDFName.of("Image")) {
        count += 1;
      }
    }
  }
  return count;
}

async function testDrawnSignaturePdfFill() {
  const drawn = blockDrawnSignatureValue();
  const templatePath = "/documents/w-4.pdf";
  const publicPath = path.join(process.cwd(), "public", "documents", "w-4.pdf");
  assert(fs.existsSync(publicPath), "w-4.pdf template missing");

  const loadTemplate = async () => fs.readFileSync(publicPath).buffer;
  const result = await fillPdf(
    templatePath,
    {
      employee_signature_step5: drawn,
      employee_date_step5: "07/02/2026",
    },
    loadTemplate
  );

  assert(result.filledCount >= 2, `expected W-4 signature/date fill, got ${result.filledCount}`);

  const verified = await verifyFilledPdf(result.pdfBytes, {
    employee_signature_step5: drawn,
    employee_date_step5: "07/02/2026",
  });
  assert(verified >= 1, `drawn signature should verify in filled PDF (got ${verified})`);

  const doc = await PDFDocument.load(result.pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();
  assert(
    !form.getFieldMaybe("employee_signature_step5"),
    "W-4 signature field should be flattened before image stamp"
  );

  // Confirm a signature image was stamped onto page content.
  const imageCount = countPageImageXObjects(doc, 0);
  assert(imageCount > 0, `W-4 page should contain stamped signature image XObjects (got ${imageCount})`);
  console.log("✓ drawn signature fills English W-4 PDF correctly");
}

function testSpanishDrawnSignatureValidation() {
  const drawn = blockDrawnSignatureValue();
  const today = "07/02/2026";
  const values = {
    "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": "Maria",
    "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": "Garcia",
    "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]": "123 Calle Test",
    "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]": "Detroit, MI",
    "topmostSubform[0].Page1[0].f1_05[0]": "123-45-6789",
    "topmostSubform[0].Page1[0].c1_1[0]": true,
    employee_signature_step5_sp: drawn,
    employee_date_step5_sp: today,
  };

  const missing = getMissingFieldIssues(w4SpanishRequiredRules, values);
  assert(missing.length === 0, `drawn Spanish W-4 signature should satisfy validation (${missing.length} missing)`);
  console.log("✓ drawn signature satisfies Spanish W-4 validation");
}

async function testSpanishDrawnSignaturePdfFill() {
  const drawn = blockDrawnSignatureValue();
  const templatePath = "/documents/w-4-spanish.pdf";
  const publicPath = path.join(process.cwd(), "public", "documents", "w-4-spanish.pdf");
  assert(fs.existsSync(publicPath), "w-4-spanish.pdf template missing");

  const loadTemplate = async () => fs.readFileSync(publicPath).buffer;
  const result = await fillPdf(
    templatePath,
    {
      employee_signature_step5_sp: drawn,
      employee_date_step5_sp: "07/02/2026",
    },
    loadTemplate
  );

  assert(result.filledCount >= 2, `expected Spanish W-4 signature/date fill, got ${result.filledCount}`);

  const verified = await verifyFilledPdf(result.pdfBytes, {
    employee_signature_step5_sp: drawn,
    employee_date_step5_sp: "07/02/2026",
  });
  assert(verified >= 1, `Spanish drawn signature should verify in filled PDF (got ${verified})`);

  const doc = await PDFDocument.load(result.pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();
  assert(
    !form.getFieldMaybe("employee_signature_step5_sp"),
    "Spanish W-4 signature field should be flattened before image stamp"
  );

  const imageCount = countPageImageXObjects(doc, 0);
  assert(imageCount > 0, `Spanish W-4 page should contain stamped signature image XObjects (got ${imageCount})`);
  console.log("✓ drawn signature fills Spanish W-4 PDF correctly");
}

function testUiWiring() {
  const root = process.cwd();
  const acroPdfPage = fs.readFileSync(
    path.join(root, "src/components/employee-onboarding/AcroPdfPage.tsx"),
    "utf8"
  );
  const acroSignature = fs.readFileSync(
    path.join(root, "src/components/employee-onboarding/AcroSignatureField.tsx"),
    "utf8"
  );

  assert(acroPdfPage.includes("AcroSignatureField"), "AcroPdfPage must render AcroSignatureField");
  assert(acroPdfPage.includes("isPdfSignatureField"), "AcroPdfPage must gate signature fields");
  assert(acroSignature.includes("SignaturePad"), "AcroSignatureField must use SignaturePad");
  assert(acroSignature.includes("Click to sign"), "AcroSignatureField must show click-to-sign prompt");
  console.log("✓ signature UI wiring");
}

async function main() {
  console.log("=== Signature + W-4 Test Suite ===\n");
  testEncodeDecodeRoundTrip();
  testSignatureFieldRegistry();
  testW4MirrorClearBehavior();
  testDrawnSignatureValidation();
  await testDrawnSignaturePdfFill();
  testSpanishDrawnSignatureValidation();
  await testSpanishDrawnSignaturePdfFill();
  testUiWiring();
  console.log("\n=== ALL SIGNATURE TESTS PASSED ===");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
