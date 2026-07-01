import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildDirectDepositPdfBytes,
  normalizeDirectDepositValues,
  usesDirectDeposit,
  type DirectDepositValues,
} from "@/lib/employee-onboarding/directDeposit";
import { buildOnboardingPacket } from "@/lib/employee-onboarding/fillPdf";
import { EMPTY_FORM_VALUES, type FormValuesState } from "@/lib/employee-onboarding/loadDraft";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import { getOnboardingFormConfigs } from "@/lib/employee-onboarding/pdfForms";

async function loadPublicTemplate(templatePath: string): Promise<ArrayBuffer> {
  const filePath = path.join(process.cwd(), "public", templatePath.replace(/^\//, ""));
  const bytes = await readFile(filePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function normalizeSubmissionFormValues(
  formValues: Partial<FormValuesState> | undefined
): FormValuesState {
  if (!formValues) return EMPTY_FORM_VALUES;
  return {
    employment: formValues.employment ?? {},
    w4: formValues.w4 ?? {},
    i9: formValues.i9 ?? {},
    wh151: formValues.wh151 ?? {},
    wh153: formValues.wh153 ?? {},
  };
}

export async function buildSubmissionPacket(
  formValues: FormValuesState,
  directDepositValues: DirectDepositValues,
  locale: Locale = "en"
) {
  const normalizedDirectDeposit = normalizeDirectDepositValues(directDepositValues);
  const appendPdfBytes = usesDirectDeposit(normalizedDirectDeposit)
    ? [await buildDirectDepositPdfBytes(normalizedDirectDeposit)]
    : undefined;

  return buildOnboardingPacket(
    getOnboardingFormConfigs(locale).map((config) => ({
      templatePath: config.templatePath,
      values: formValues[config.id] ?? {},
    })),
    { appendPdfBytes, loadTemplate: loadPublicTemplate }
  );
}
