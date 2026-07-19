/**
 * Local-only demo: fill an English W-4 with sample data and save to Downloads.
 * Does not send email.
 *
 *   npx tsx scripts/demo-w4-download.ts
 */
import fs from "fs";
import path from "path";
import { fillPdf } from "../src/lib/employee-onboarding/fillPdf";
import { mapAnswersToPdfValues } from "../src/lib/employee-onboarding/onboardingAnswers";
import { getQuietAutofillPayload } from "../src/lib/employee-onboarding/devAutofill";

async function main() {
  const { answers, signature } = getQuietAutofillPayload("en");
  const formValues = mapAnswersToPdfValues(answers, signature);

  const templatePath = path.join(process.cwd(), "public", "documents", "w-4.pdf");
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing template: ${templatePath}`);
  }

  const downloadsDir = path.join(process.env.USERPROFILE ?? process.cwd(), "Downloads");
  fs.mkdirSync(downloadsDir, { recursive: true });
  const outPath = path.join(downloadsDir, "W4-Demo-John-Doe.pdf");

  const result = await fillPdf("/documents/w-4.pdf", formValues.w4, async () =>
    fs.readFileSync(templatePath).buffer
  );

  fs.writeFileSync(outPath, result.pdfBytes);
  console.log(`Saved: ${outPath}`);
  console.log(`Filled fields: ${result.filledCount}`);
  console.log(`Size: ${result.pdfBytes.length} bytes`);
  console.log("No email sent.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
