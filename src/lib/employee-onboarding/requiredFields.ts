import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import { getMissingFieldIssues } from "@/lib/employee-onboarding/fieldLabels";

/** I-9 Section 1 — employee info & attestation (circled area on page 1). */
export const I9_SECTION1_HIGHLIGHT_FIELDS = [
  "Last Name (Family Name)",
  "Last Name Family Name from Section 1",
  "First Name Given Name",
  "First Name Given Name from Section 1",
  "Employee Middle Initial (if any)",
  "Middle initial if any from Section 1",
  "Employee Other Last Names Used (if any)",
  "Address Street Number and Name",
  "Apt Number (if any)",
  "City or Town",
  "State",
  "ZIP Code",
  "Date of Birth mmddyyyy",
  "US Social Security Number",
  "Employees E-mail Address",
  "Telephone Number",
  "CB_1",
  "CB_2",
  "CB_3",
  "CB_4",
  "3 A lawful permanent resident Enter USCIS or ANumber",
  "Exp Date mmddyyyy",
  "USCIS ANumber",
  "Form I94 Admission Number",
  "Foreign Passport Number and Country of IssuanceRow1",
  "Signature of Employee",
  "Today's Date mmddyyy"
] as const;

/** Must be filled before leaving I-9 (optional-on-form fields excluded). */
export const I9_SECTION1_VALIDATE_FIELDS = [
  "Last Name (Family Name)",
  "First Name Given Name",
  "Address Street Number and Name",
  "City or Town",
  "State",
  "ZIP Code",
  "Date of Birth mmddyyyy",
  "US Social Security Number",
  "Employees E-mail Address",
  "Telephone Number",
  "Signature of Employee",
  "Today's Date mmddyyy"
] as const;

export const I9_CITIZENSHIP_CHECKBOXES = ["CB_1", "CB_2", "CB_3", "CB_4"] as const;

/** Some I-9 Section 1 fields appear twice in the PDF under different names. */
export const I9_VALIDATE_FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "Last Name (Family Name)": ["Last Name (Family Name)", "Last Name Family Name from Section 1"],
  "First Name Given Name": ["First Name Given Name", "First Name Given Name from Section 1"]
};

export const I9_MIRROR_FIELD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["Last Name (Family Name)", "Last Name Family Name from Section 1"],
  ["First Name Given Name", "First Name Given Name from Section 1"],
  ["Employee Middle Initial (if any)", "Middle initial if any from Section 1"]
];

export function mirrorI9FieldValues(values: Record<string, PdfFieldValue>): Record<string, PdfFieldValue> {
  const mirrored = { ...values };
  for (const [primary, duplicate] of I9_MIRROR_FIELD_PAIRS) {
    if (isFieldValueFilled(mirrored[primary]) && !isFieldValueFilled(mirrored[duplicate])) {
      mirrored[duplicate] = mirrored[primary];
    } else if (isFieldValueFilled(mirrored[duplicate]) && !isFieldValueFilled(mirrored[primary])) {
      mirrored[primary] = mirrored[duplicate];
    }
  }
  return mirrored;
}

/** WH-151PS employee signature areas (circled on form). */
export const WH151_HIGHLIGHT_FIELDS = ["Text440", "Text441"] as const;

export const WH151_VALIDATE_FIELDS = ["Text440", "Text441"] as const;

export type RequiredFieldRules = {
  highlightFields: readonly string[];
  validateFields: readonly string[];
  checkboxGroups?: readonly (readonly string[])[];
  validateFieldAliases?: Readonly<Record<string, readonly string[]>>;
};

export const i9RequiredRules: RequiredFieldRules = {
  highlightFields: I9_SECTION1_HIGHLIGHT_FIELDS,
  validateFields: I9_SECTION1_VALIDATE_FIELDS,
  checkboxGroups: [I9_CITIZENSHIP_CHECKBOXES],
  validateFieldAliases: I9_VALIDATE_FIELD_ALIASES
};

export const wh151RequiredRules: RequiredFieldRules = {
  highlightFields: WH151_HIGHLIGHT_FIELDS,
  validateFields: WH151_VALIDATE_FIELDS
};

/** W-4 Step 1 — name, address, SSN, filing status, signature, date. */
export const W4_STEP1_FIELDS = [
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  "topmostSubform[0].Page1[0].c1_1[0]",
  "topmostSubform[0].Page1[0].c1_1[1]",
  "topmostSubform[0].Page1[0].c1_1[2]",
  "topmostSubform[0].Page1[0].f1_13[0]",
  "topmostSubform[0].Page1[0].f1_14[0]"
] as const;

export const W4_VALIDATE_FIELDS = [
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]",
  "topmostSubform[0].Page1[0].f1_05[0]",
  "topmostSubform[0].Page1[0].f1_13[0]",
  "topmostSubform[0].Page1[0].f1_14[0]"
] as const;

export const W4_FILING_STATUS_CHECKBOXES = [
  "topmostSubform[0].Page1[0].c1_1[0]",
  "topmostSubform[0].Page1[0].c1_1[1]",
  "topmostSubform[0].Page1[0].c1_1[2]"
] as const;

export const w4RequiredRules: RequiredFieldRules = {
  highlightFields: W4_STEP1_FIELDS,
  validateFields: W4_VALIDATE_FIELDS,
  checkboxGroups: [W4_FILING_STATUS_CHECKBOXES]
};

export function isFieldValueFilled(value: PdfFieldValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

export function getMissingRequiredFields(
  rules: RequiredFieldRules,
  values: Record<string, PdfFieldValue>
): string[] {
  return getMissingFieldIssues(rules, values).map((issue) => issue.fieldKey);
}

export function scrollToPdfField(root: ParentNode, fieldKey: string): boolean {
  const fieldEl = root.querySelector<HTMLElement>(
    `.react-acroform-field[data-field-name="${CSS.escape(fieldKey)}"]`
  );
  if (!fieldEl) return false;

  fieldEl.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable = fieldEl.querySelector<HTMLElement>(
    "input:not([type='hidden']), textarea, select, [tabindex]"
  );
  focusable?.focus({ preventScroll: true });

  return true;
}

export function markMissingPdfFields(root: ParentNode, fieldKeys: readonly string[]) {
  const missing = new Set(fieldKeys);

  root.querySelectorAll<HTMLElement>(".react-acroform-field[data-field-name]").forEach((fieldEl) => {
    const name = fieldEl.getAttribute("data-field-name");
    if (!name) return;

    if (missing.has(name)) {
      fieldEl.classList.add("pdf-field-missing");
    } else {
      fieldEl.classList.remove("pdf-field-missing");
    }
  });
}

export function clearMissingPdfFieldMarks(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".react-acroform-field.pdf-field-missing").forEach((fieldEl) => {
    fieldEl.classList.remove("pdf-field-missing");
  });
}

export function applyRequiredFieldHighlight(root: ParentNode, highlightFields: readonly string[]) {
  const required = new Set(highlightFields);

  root.querySelectorAll<HTMLElement>(".react-acroform-field[data-field-name]").forEach((fieldEl) => {
    const name = fieldEl.getAttribute("data-field-name");
    if (!name) return;

    if (required.has(name)) {
      fieldEl.classList.add("pdf-field-required");
      fieldEl.setAttribute("data-required-highlight", "true");
    } else {
      fieldEl.classList.remove("pdf-field-required");
      fieldEl.removeAttribute("data-required-highlight");
    }
  });
}
