import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";
import { isFieldValueFilled } from "@/lib/employee-onboarding/requiredFields";

/** Step 3 dependents: (a), (b), and total (3). */
export const W4_ENGLISH_STEP3_FIELDS = [
  "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]",
  "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]",
  "topmostSubform[0].Page1[0].f1_08[0]",
] as const;

export const W4_SPANISH_STEP3_FIELDS = [
  "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]",
  "topmostSubform[0].Page1[0].f1_07[0]",
  "topmostSubform[0].Page1[0].f1_08[0]",
] as const;

/**
 * Legacy IRS W-4 fields that are superseded by the custom Step 5 fields above.
 * These should be hidden in the UI so they don't create ghost overlays on top of
 * the custom employee_signature_step5 / employee_date_step5 boxes.
 */
export const W4_LEGACY_STEP5_FIELDS = new Set([
  "topmostSubform[0].Page1[0].f1_12[0]",
  "topmostSubform[0].Page1[0].f1_13[0]",
]);

/** Step 5 employee sign/date boxes (custom fields on updated W-4 PDFs). */
export const W4_ENGLISH_SIGNATURE_DATE_FIELDS = [
  "employee_signature_step5",
  "employee_date_step5",
] as const;

export const W4_SPANISH_SIGNATURE_DATE_FIELDS = [
  "employee_signature_step5_sp",
  "employee_date_step5_sp",
] as const;

export const W4_ENGLISH_HIGHLIGHT_FIELDS = [
  ...W4_ENGLISH_STEP3_FIELDS,
  ...W4_ENGLISH_SIGNATURE_DATE_FIELDS,
] as const;

export const W4_SPANISH_HIGHLIGHT_FIELDS = [
  ...W4_SPANISH_STEP3_FIELDS,
  ...W4_SPANISH_SIGNATURE_DATE_FIELDS,
] as const;

export const W4_ENGLISH_VALIDATE_FIELDS = [
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  ...W4_ENGLISH_SIGNATURE_DATE_FIELDS,
] as const;

export const W4_SPANISH_VALIDATE_FIELDS = [
  "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  ...W4_SPANISH_SIGNATURE_DATE_FIELDS,
] as const;

export const W4_FILING_STATUS_CHECKBOXES = [
  "topmostSubform[0].Page1[0].c1_1[0]",
  "topmostSubform[0].Page1[0].c1_1[1]",
  "topmostSubform[0].Page1[0].c1_1[2]",
] as const;

/** Map English W-4 field keys to Spanish (and back) when switching locale. */
export const W4_LOCALE_FIELD_MIRRORS: ReadonlyArray<readonly [string, string]> = [
  ["topmostSubform[0].Page1[0].Step1a[0].f1_01[0]", "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]"],
  ["topmostSubform[0].Page1[0].Step1a[0].f1_02[0]", "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]"],
  ["topmostSubform[0].Page1[0].Step1a[0].f1_03[0]", "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]"],
  ["topmostSubform[0].Page1[0].Step1a[0].f1_04[0]", "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]"],
  ["topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]", "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]"],
  ["topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]", "topmostSubform[0].Page1[0].f1_07[0]"],
  ["topmostSubform[0].Page1[0].f1_08[0]", "topmostSubform[0].Page1[0].f1_08[0]"],
  ["employee_signature_step5", "employee_signature_step5_sp"],
  ["employee_date_step5", "employee_date_step5_sp"],
];

export function mirrorW4FieldValues(
  values: Record<string, PdfFieldValue>,
  activeLocale?: Locale
): Record<string, PdfFieldValue> {
  const mirrored = { ...values };
  for (const [englishKey, spanishKey] of W4_LOCALE_FIELD_MIRRORS) {
    if (activeLocale === "en" && englishKey in mirrored) {
      mirrored[spanishKey] = mirrored[englishKey];
      continue;
    }
    if (activeLocale === "es" && spanishKey in mirrored) {
      mirrored[englishKey] = mirrored[spanishKey];
      continue;
    }
    if (isFieldValueFilled(mirrored[englishKey]) && !isFieldValueFilled(mirrored[spanishKey])) {
      mirrored[spanishKey] = mirrored[englishKey];
    } else if (isFieldValueFilled(mirrored[spanishKey]) && !isFieldValueFilled(mirrored[englishKey])) {
      mirrored[englishKey] = mirrored[spanishKey];
    }
  }
  return mirrored;
}

export const w4EnglishRequiredRules: RequiredFieldRules = {
  highlightFields: W4_ENGLISH_HIGHLIGHT_FIELDS,
  emphasisFields: W4_ENGLISH_SIGNATURE_DATE_FIELDS,
  highlightPages: [1],
  validateFields: W4_ENGLISH_VALIDATE_FIELDS,
  checkboxGroups: [W4_FILING_STATUS_CHECKBOXES],
};

export const w4SpanishRequiredRules: RequiredFieldRules = {
  highlightFields: W4_SPANISH_HIGHLIGHT_FIELDS,
  emphasisFields: W4_SPANISH_SIGNATURE_DATE_FIELDS,
  highlightPages: [1],
  validateFields: W4_SPANISH_VALIDATE_FIELDS,
  checkboxGroups: [W4_FILING_STATUS_CHECKBOXES],
};
