import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";
import { isFieldValueFilled } from "@/lib/employee-onboarding/requiredFields";

/** Employee signature and date only — highlighted in yellow on W-4. */
export const W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS = [
  "topmostSubform[0].Page1[0].f1_13[0]",
  "topmostSubform[0].Page1[0].f1_14[0]",
] as const;

export const W4_ENGLISH_STEP1_FIELDS = [
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  "topmostSubform[0].Page1[0].c1_1[0]",
  "topmostSubform[0].Page1[0].c1_1[1]",
  "topmostSubform[0].Page1[0].c1_1[2]",
  ...W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS,
] as const;

export const W4_SPANISH_STEP1_FIELDS = [
  "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  "topmostSubform[0].Page1[0].c1_1[0]",
  "topmostSubform[0].Page1[0].c1_1[1]",
  "topmostSubform[0].Page1[0].c1_1[2]",
  ...W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS,
] as const;

export const W4_ENGLISH_VALIDATE_FIELDS = [
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  ...W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS,
] as const;

export const W4_SPANISH_VALIDATE_FIELDS = [
  "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  ...W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS,
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
  ["topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]", "topmostSubform[0].Page1[0].f1_07[0]"],
];

export function mirrorW4FieldValues(values: Record<string, PdfFieldValue>): Record<string, PdfFieldValue> {
  const mirrored = { ...values };
  for (const [englishKey, spanishKey] of W4_LOCALE_FIELD_MIRRORS) {
    if (isFieldValueFilled(mirrored[englishKey]) && !isFieldValueFilled(mirrored[spanishKey])) {
      mirrored[spanishKey] = mirrored[englishKey];
    } else if (isFieldValueFilled(mirrored[spanishKey]) && !isFieldValueFilled(mirrored[englishKey])) {
      mirrored[englishKey] = mirrored[spanishKey];
    }
  }
  return mirrored;
}

export const w4EnglishRequiredRules: RequiredFieldRules = {
  highlightFields: W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS,
  validateFields: W4_ENGLISH_VALIDATE_FIELDS,
  checkboxGroups: [W4_FILING_STATUS_CHECKBOXES],
};

export const w4SpanishRequiredRules: RequiredFieldRules = {
  highlightFields: W4_SIGNATURE_DATE_HIGHLIGHT_FIELDS,
  validateFields: W4_SPANISH_VALIDATE_FIELDS,
  checkboxGroups: [W4_FILING_STATUS_CHECKBOXES],
};
