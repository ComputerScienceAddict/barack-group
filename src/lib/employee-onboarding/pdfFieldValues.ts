import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import {
  isSocialSecurityPdfFieldName,
  sanitizeSocialSecurityDigits,
} from "@/lib/employee-onboarding/requiredFields";

function cssFieldSelector(fieldName: string) {
  return `.react-acroform-field[data-field-name="${CSS.escape(fieldName)}"]`;
}

function isPdfFieldValueEmpty(value: PdfFieldValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim().length === 0;
}

function normalizeCollectedFieldValue(name: string, value: string): PdfFieldValue {
  if (isSocialSecurityPdfFieldName(name)) {
    return sanitizeSocialSecurityDigits(value);
  }
  return value;
}

/** Read live values from PDF overlay inputs (source of truth for what the user typed). */
export function collectDomFieldValues(root: ParentNode): Record<string, PdfFieldValue> {
  const values: Record<string, PdfFieldValue> = {};
  const radioFieldNames = new Set<string>();

  root.querySelectorAll<HTMLElement>(".react-acroform-field[data-field-name]").forEach((fieldEl) => {
    const name = fieldEl.getAttribute("data-field-name");
    if (!name) return;

    if (fieldEl.classList.contains("react-acroform-field--radio")) {
      radioFieldNames.add(name);
      return;
    }

    const textInput = fieldEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      "textarea, input:not([type='checkbox']):not([type='radio']):not([type='hidden'])"
    );
    if (textInput) {
      values[name] = normalizeCollectedFieldValue(name, textInput.value);
      return;
    }

    const select = fieldEl.querySelector<HTMLSelectElement>("select");
    if (select) {
      values[name] = select.value;
      return;
    }

    const checkbox = fieldEl.querySelector<HTMLInputElement>("input[type='checkbox']");
    if (checkbox) {
      values[name] = checkbox.checked;
    }
  });

  for (const name of radioFieldNames) {
    const checked = root.querySelector<HTMLInputElement>(
      `${cssFieldSelector(name)} input[type='radio']:checked`
    );
    if (checked) {
      values[name] = checked.value;
    }
  }

  return values;
}

export function valueFromFieldEvent(event: Event): { name: string; value: PdfFieldValue } | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;

  const fieldEl = target.closest<HTMLElement>(".react-acroform-field[data-field-name]");
  if (!fieldEl) return null;

  const name = fieldEl.getAttribute("data-field-name");
  if (!name) return null;

  if (target instanceof HTMLInputElement) {
    if (target.type === "checkbox") return { name, value: target.checked };
    if (target.type === "radio") return target.checked ? { name, value: target.value } : null;
    return {
      name,
      value: normalizeCollectedFieldValue(name, target.value),
    };
  }

  if (target instanceof HTMLTextAreaElement) {
    return {
      name,
      value: normalizeCollectedFieldValue(name, target.value),
    };
  }

  if (target instanceof HTMLSelectElement) {
    return { name, value: target.value };
  }

  return null;
}

export function mergePdfFieldValues(
  stateValues: Record<string, PdfFieldValue>,
  domValues: Record<string, PdfFieldValue>
): Record<string, PdfFieldValue> {
  const merged: Record<string, PdfFieldValue> = { ...stateValues };

  for (const [key, domValue] of Object.entries(domValues)) {
    const stateValue = stateValues[key];
    if (isPdfFieldValueEmpty(domValue) && !isPdfFieldValueEmpty(stateValue)) {
      continue;
    }
    merged[key] = domValue;
  }

  return merged;
}

export function pdfFieldValuesEqual(
  a: Record<string, PdfFieldValue>,
  b: Record<string, PdfFieldValue>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function countNonEmptyFieldValues(fieldValues: Record<string, PdfFieldValue>): number {
  return Object.values(fieldValues).filter((value) => {
    if (typeof value === "boolean") return value;
    if (Array.isArray(value)) return value.length > 0;
    return String(value ?? "").trim().length > 0;
  }).length;
}
