import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFForm,
  PDFRadioGroup,
  PDFTextField
} from "pdf-lib";

export type PdfFieldValue = string | boolean | string[];

export type FillPdfResult = {
  pdfBytes: Uint8Array;
  filledCount: number;
  missingFields: string[];
  verifiedCount: number;
};

export async function loadPdfBytes(templatePath: string): Promise<ArrayBuffer> {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  return response.arrayBuffer();
}

import { mirrorI9FieldValues } from "@/lib/employee-onboarding/requiredFields";

export async function fillPdfFromBytes(
  templateBytes: ArrayBuffer,
  fieldValues: Record<string, PdfFieldValue>
): Promise<FillPdfResult> {
  const normalized = normalizeFieldValues(mirrorI9FieldValues(fieldValues));

  if (Object.keys(normalized).length === 0) {
    return {
      pdfBytes: new Uint8Array(templateBytes),
      filledCount: 0,
      missingFields: [],
      verifiedCount: 0
    };
  }

  const doc = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const form = doc.getForm();

  const pdfFieldNames = new Set<string>();
  for (const field of form.getFields()) {
    try {
      const name = field.getName();
      if (name) pdfFieldNames.add(name);
    } catch {
      // Skip unreadable fields.
    }
  }

  let filledCount = 0;
  const missingFields: string[] = [];

  for (const [fieldName, value] of Object.entries(normalized)) {
    if (!pdfFieldNames.has(fieldName)) {
      missingFields.push(fieldName);
      continue;
    }

    try {
      if (setFormFieldValue(form, fieldName, value)) {
        filledCount += 1;
      } else {
        missingFields.push(fieldName);
      }
    } catch {
      missingFields.push(fieldName);
    }
  }

  try {
    form.updateFieldAppearances();
  } catch {
    // Some government PDFs still save /V values without custom appearances.
  }

  const pdfBytes = await doc.save();
  const verifiedCount = await verifyFilledPdf(pdfBytes, normalized);

  return {
    pdfBytes,
    filledCount,
    missingFields,
    verifiedCount
  };
}

export function normalizeFieldValues(fieldValues: Record<string, PdfFieldValue>): Record<string, PdfFieldValue> {
  const normalized: Record<string, PdfFieldValue> = {};

  for (const [name, value] of Object.entries(fieldValues)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (typeof value === "boolean" && value === false) continue;
    normalized[name] = value;
  }

  return normalized;
}

function setFormFieldValue(form: PDFForm, fieldName: string, value: PdfFieldValue): boolean {
  const field = form.getFieldMaybe(fieldName);
  if (!field) return false;

  if (field instanceof PDFTextField) {
    const text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    field.setText(text);
    return true;
  }

  if (field instanceof PDFCheckBox) {
    const checked =
      value === true || value === "true" || value === "Yes" || value === "On" || value === "1";
    if (checked) field.check();
    else field.uncheck();
    return true;
  }

  if (field instanceof PDFDropdown) {
    const choice = Array.isArray(value) ? value[0] : String(value ?? "");
    if (!choice) return false;
    field.select(choice);
    return true;
  }

  if (field instanceof PDFRadioGroup) {
    const choice = String(value ?? "");
    if (!choice) return false;
    field.select(choice);
    return true;
  }

  return false;
}

export async function verifyFilledPdf(
  pdfBytes: Uint8Array,
  fieldValues: Record<string, PdfFieldValue>
): Promise<number> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();
  let verified = 0;

  for (const [name, expected] of Object.entries(fieldValues)) {
    const field = form.getFieldMaybe(name);
    if (!field) continue;

    try {
      if (typeof expected === "boolean" && field instanceof PDFCheckBox) {
        if (field.isChecked() === expected) verified += 1;
        continue;
      }

      if (field instanceof PDFTextField) {
        const actual = field.getText() ?? "";
        const expectedText = Array.isArray(expected) ? expected.join(", ") : String(expected);
        if (actual === expectedText) verified += 1;
      }
    } catch {
      // Skip fields that cannot be read back.
    }
  }

  return verified;
}

export async function fillPdf(templatePath: string, fieldValues: Record<string, PdfFieldValue>): Promise<FillPdfResult> {
  const templateBytes = await loadPdfBytes(templatePath);
  return fillPdfFromBytes(templateBytes, fieldValues);
}

export function downloadPdfBytes(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function fillAndDownloadPdf(
  templatePath: string,
  fieldValues: Record<string, PdfFieldValue>,
  filename: string
): Promise<FillPdfResult> {
  const result = await fillPdf(templatePath, fieldValues);
  downloadPdfBytes(result.pdfBytes, filename);
  return result;
}

export type OnboardingPacketEntry = {
  templatePath: string;
  values: Record<string, PdfFieldValue>;
};

export type OnboardingPacketResult = {
  pdfBytes: Uint8Array;
  formResults: FillPdfResult[];
  pageCount: number;
};

function hasNonEmptyValues(values: Record<string, PdfFieldValue>): boolean {
  return Object.keys(normalizeFieldValues(values)).length > 0;
}

export async function buildOnboardingPacket(
  entries: OnboardingPacketEntry[],
  options?: { appendPdfBytes?: Uint8Array[] }
): Promise<OnboardingPacketResult> {
  const mergedDoc = await PDFDocument.create();
  const formResults: FillPdfResult[] = [];

  for (const entry of entries) {
    const result = await fillPdf(entry.templatePath, entry.values);
    if (hasNonEmptyValues(entry.values) && result.filledCount === 0) {
      throw new Error(`Could not save field values into ${entry.templatePath}.`);
    }

    formResults.push(result);
    const filledDoc = await PDFDocument.load(result.pdfBytes, { ignoreEncryption: true });
    const form = filledDoc.getForm();
    if (form.getFields().length > 0) {
      form.flatten();
    }
    const copiedPages = await mergedDoc.copyPages(filledDoc, filledDoc.getPageIndices());
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  for (const extraBytes of options?.appendPdfBytes ?? []) {
    const extraDoc = await PDFDocument.load(extraBytes, { ignoreEncryption: true });
    const copiedPages = await mergedDoc.copyPages(extraDoc, extraDoc.getPageIndices());
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  const pdfBytes = await mergedDoc.save();
  return {
    pdfBytes,
    formResults,
    pageCount: mergedDoc.getPageCount()
  };
}

export async function downloadOnboardingPacket(
  entries: OnboardingPacketEntry[],
  filename: string,
  options?: { appendPdfBytes?: Uint8Array[] }
): Promise<OnboardingPacketResult> {
  const result = await buildOnboardingPacket(entries, options);
  downloadPdfBytes(result.pdfBytes, filename);
  return result;
}
