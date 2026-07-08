import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import { getMissingFieldIssues } from "@/lib/employee-onboarding/fieldLabels";
import { I9_CONTACT_HIGHLIGHT_FIELDS, mergeHighlightFields } from "@/lib/employee-onboarding/contactFields";
import type { MessageKey } from "@/lib/employee-onboarding/i18n";

/** I-9 nine-digit comb field (U.S. Social Security Number). */
export const I9_SSN_FIELD = "US Social Security Number" as const;

/** Keep digits only; I-9 SSN comb boxes store up to nine characters. */
export function sanitizeSocialSecurityDigits(value: PdfFieldValue | undefined): string {
  return String(value ?? "").replace(/\D/g, "").slice(0, 9);
}

export function resolveSocialSecurityValue(
  values: Record<string, PdfFieldValue>
): PdfFieldValue | undefined {
  if (values[I9_SSN_FIELD] !== undefined) {
    return sanitizeSocialSecurityDigits(values[I9_SSN_FIELD]);
  }

  for (const [name, value] of Object.entries(values)) {
    if (isSocialSecurityPdfFieldName(name)) {
      return sanitizeSocialSecurityDigits(value);
    }
  }

  return undefined;
}

/** I-9 Section 1 — employee info & attestation (page 1 only). */
export const I9_SECTION1_HIGHLIGHT_FIELDS = [
  "Last Name (Family Name)",
  "First Name Given Name",
  "Employee Other Last Names Used (if any)",
  "Address Street Number and Name",
  "Apt Number (if any)",
  "City or Town",
  "State",
  "ZIP Code",
  "Date of Birth mmddyyyy",
  I9_SSN_FIELD,
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

/** I-9 SSN and phone — extra-visible yellow box. */
export const I9_EMPHASIS_FIELDS = [I9_SSN_FIELD, "Telephone Number"] as const;

export function isSocialSecurityPdfFieldName(name: string): boolean {
  return /social security/i.test(name);
}

export function isTelephonePdfFieldName(name: string): boolean {
  return /telephone number/i.test(name);
}

/** Must be filled before leaving I-9 (optional-on-form fields excluded). */
export const I9_SECTION1_VALIDATE_FIELDS = [
  "Last Name (Family Name)",
  "First Name Given Name",
  "Address Street Number and Name",
  "City or Town",
  "State",
  "ZIP Code",
  "Date of Birth mmddyyyy",
  I9_SSN_FIELD,
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

/** Mirror aliases and normalize the nine-digit SSN comb value before validation/save. */
export function normalizeI9FormValues(values: Record<string, PdfFieldValue>): Record<string, PdfFieldValue> {
  const mirrored = mirrorI9FieldValues(values);
  const ssn = sanitizeSocialSecurityDigits(resolveSocialSecurityValue(mirrored));
  if (!ssn) return mirrored;
  return { ...mirrored, [I9_SSN_FIELD]: ssn };
}

/** @deprecated Import from wh151Fields.ts */
export {
  WH151_HIGHLIGHT_FIELDS,
  WH151_VALIDATE_FIELDS,
  wh151RequiredRules,
} from "@/lib/employee-onboarding/wh151Fields";

export type RequiredFieldRules = {
  highlightFields: readonly string[];
  /** Never show yellow required highlight on these PDF field names. */
  excludeHighlightFields?: readonly string[];
  /** Do not render HTML overlays for these fields (PDF print lines remain visible). */
  hiddenOverlayFields?: readonly string[];
  /** Stronger yellow box for critical fields (e.g. I-9 SSN). */
  emphasisFields?: readonly string[];
  /** When set, yellow highlights apply only on these PDF page numbers (1-based). */
  highlightPages?: readonly number[];
  validateFields: readonly string[];
  checkboxGroups?: readonly (readonly string[])[];
  labeledCheckboxGroups?: readonly {
    groupKey: string;
    fields: readonly string[];
    labelKey: MessageKey;
  }[];
  validateFieldAliases?: Readonly<Record<string, readonly string[]>>;
  /** Per-field fill checks (e.g. nine-digit SSN comb boxes). */
  validateFieldPredicates?: Readonly<
    Record<string, (value: PdfFieldValue | undefined) => boolean>
  >;
};

export const i9RequiredRules: RequiredFieldRules = {
  highlightFields: mergeHighlightFields(I9_SECTION1_HIGHLIGHT_FIELDS, I9_CONTACT_HIGHLIGHT_FIELDS),
  emphasisFields: I9_EMPHASIS_FIELDS,
  highlightPages: [1],
  validateFields: I9_SECTION1_VALIDATE_FIELDS,
  checkboxGroups: [I9_CITIZENSHIP_CHECKBOXES],
  validateFieldAliases: I9_VALIDATE_FIELD_ALIASES,
  validateFieldPredicates: {
    [I9_SSN_FIELD]: isCompleteSocialSecurityValue,
  },
};

export function isFieldValueFilled(value: PdfFieldValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

/** I-9 SSN comb field must contain nine digits. */
export function isCompleteSocialSecurityValue(value: PdfFieldValue | undefined): boolean {
  return sanitizeSocialSecurityDigits(value).length === 9;
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

function getPdfFieldPageNumber(fieldEl: HTMLElement): number | null {
  const pageEl = fieldEl.closest<HTMLElement>(".react-acroform-page[data-page-number]");
  if (!pageEl) return null;
  const pageNumber = Number(pageEl.getAttribute("data-page-number"));
  return Number.isFinite(pageNumber) ? pageNumber : null;
}

function shouldEmphasizePdfField(
  name: string,
  emphasisFields?: readonly string[]
): boolean {
  if (emphasisFields?.includes(name)) return true;
  if (emphasisFields) return false;
  return isSocialSecurityPdfFieldName(name) || isTelephonePdfFieldName(name);
}

function shouldHighlightPdfField(
  name: string,
  required: ReadonlySet<string>,
  emphasisFields?: readonly string[]
): boolean {
  if (required.has(name)) return true;
  if (emphasisFields?.includes(name)) return true;
  if (emphasisFields) return false;
  return isSocialSecurityPdfFieldName(name) || isTelephonePdfFieldName(name);
}

export function applyRequiredFieldHighlight(
  root: ParentNode,
  highlightFields: readonly string[],
  highlightPages?: readonly number[],
  emphasisFields?: readonly string[],
  excludeHighlightFields?: readonly string[]
) {
  const required = new Set(highlightFields);
  const excluded = new Set(excludeHighlightFields ?? []);
  const pageFilter =
    highlightPages && highlightPages.length > 0 ? new Set(highlightPages) : null;

  root.querySelectorAll<HTMLElement>(".react-acroform-field[data-field-name]").forEach((fieldEl) => {
    const name = fieldEl.getAttribute("data-field-name");
    if (!name) return;

    if (excluded.has(name)) {
      fieldEl.classList.remove("pdf-field-required", "pdf-field-emphasis");
      fieldEl.removeAttribute("data-required-highlight");
      fieldEl.removeAttribute("data-emphasis-highlight");
      return;
    }

    let shouldHighlight = shouldHighlightPdfField(name, required, emphasisFields);
    if (shouldHighlight && pageFilter) {
      const pageNumber = getPdfFieldPageNumber(fieldEl);
      shouldHighlight = pageNumber !== null && pageFilter.has(pageNumber);
    }

    if (shouldHighlight) {
      fieldEl.classList.add("pdf-field-required");
      fieldEl.setAttribute("data-required-highlight", "true");
      if (shouldEmphasizePdfField(name, emphasisFields)) {
        fieldEl.classList.add("pdf-field-emphasis");
        fieldEl.setAttribute("data-emphasis-highlight", "true");
      } else {
        fieldEl.classList.remove("pdf-field-emphasis");
        fieldEl.removeAttribute("data-emphasis-highlight");
      }
    } else {
      fieldEl.classList.remove("pdf-field-required", "pdf-field-emphasis");
      fieldEl.removeAttribute("data-required-highlight");
      fieldEl.removeAttribute("data-emphasis-highlight");
    }
  });
}
