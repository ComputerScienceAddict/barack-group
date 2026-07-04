import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFForm,
  PDFRadioGroup,
  PDFTextField,
} from "pdf-lib";
import type { PdfStampField } from "@/lib/employee-onboarding/extractPdfStampFields";
import {
  decodeDrawnSignature,
  expandSignatureFieldRect,
  isPdfSignatureField,
} from "@/lib/employee-onboarding/signatureFields";

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

import { normalizeI9FormValues } from "@/lib/employee-onboarding/requiredFields";

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

  const maybeBuffer = (
    globalThis as unknown as {
      Buffer?: {
        from: (value: string, encoding: "base64") => Uint8Array;
      };
    }
  ).Buffer;

  if (maybeBuffer) {
    return new Uint8Array(maybeBuffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function getPdfRect(field: PdfStampField) {
  const [x1, y1, x2, y2] = expandSignatureFieldRect(field.name, field.rect);

  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

async function stampSignatureField({
  pdfDoc,
  field,
  value,
}: {
  pdfDoc: PDFDocument;
  field: PdfStampField;
  value: PdfFieldValue;
}): Promise<boolean> {
  const signatureDataUrl = decodeDrawnSignature(String(value ?? ""));

  if (!signatureDataUrl) return false;

  const pageIndex = Math.max(0, field.page - 1);
  const page = pdfDoc.getPage(pageIndex);

  const signatureBytes = dataUrlToBytes(signatureDataUrl);

  const signatureImage =
    signatureDataUrl.startsWith("data:image/jpeg") ||
    signatureDataUrl.startsWith("data:image/jpg")
      ? await pdfDoc.embedJpg(signatureBytes)
      : await pdfDoc.embedPng(signatureBytes);

  const { x, y, width, height } = getPdfRect(field);

  const paddingX = 4;
  const paddingY = 2;

  const maxWidth = Math.max(1, width - paddingX * 2);
  const maxHeight = Math.max(1, height - paddingY * 2);

  const scale = Math.min(maxWidth / signatureImage.width, maxHeight / signatureImage.height);

  const drawWidth = signatureImage.width * scale;
  const drawHeight = signatureImage.height * scale;

  page.drawImage(signatureImage, {
    x: x + (width - drawWidth) / 2,
    y: y + (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });

  return true;
}

async function stampDrawnSignatures({
  pdfDoc,
  values,
  fields,
}: {
  pdfDoc: PDFDocument;
  values: Record<string, PdfFieldValue>;
  fields: PdfStampField[];
}): Promise<number> {
  const stamped = new Set<string>();
  let count = 0;

  for (const field of fields) {
    if (!isPdfSignatureField(field.name)) continue;
    if (stamped.has(field.name)) continue;
    if (!decodeDrawnSignature(values[field.name])) continue;

    if (await stampSignatureField({ pdfDoc, field, value: values[field.name] })) {
      stamped.add(field.name);
      count += 1;
    }
  }

  return count;
}

export async function fillPdfFromBytes(
  templateBytes: ArrayBuffer,
  fieldValues: Record<string, PdfFieldValue>,
  fields?: PdfStampField[]
): Promise<FillPdfResult> {
  const normalized = normalizeFieldValues(normalizeI9FormValues(fieldValues));

  if (Object.keys(normalized).length === 0) {
    return {
      pdfBytes: new Uint8Array(templateBytes),
      filledCount: 0,
      missingFields: [],
      verifiedCount: 0,
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

  const stampFields: PdfStampField[] =
    fields ??
    (await import("@/lib/employee-onboarding/extractPdfStampFields").then((mod) =>
      mod.extractPdfStampFields(templateBytes)
    ));

  let filledCount = 0;
  const missingFields: string[] = [];

  for (const [fieldName, value] of Object.entries(normalized)) {
    // Signatures are stamped as images after flatten — never written as text.
    if (isPdfSignatureField(fieldName)) continue;

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

  if (form.getFields().length > 0) {
    try {
      form.flatten();
    } catch {
      // Continue even if flatten fails on unusual templates.
    }
  }

  filledCount += await stampDrawnSignatures({
    pdfDoc: doc,
    values: normalized,
    fields: stampFields,
  });

  const pdfBytes = await doc.save();
  const verifiedCount = await verifyFilledPdf(pdfBytes, normalized);

  return {
    pdfBytes,
    filledCount,
    missingFields,
    verifiedCount,
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
    // Drawn signatures are page images, not form field values.
    if (isPdfSignatureField(name) && decodeDrawnSignature(expected)) {
      verified += 1;
      continue;
    }

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

export type LoadTemplateBytes = (templatePath: string) => Promise<ArrayBuffer>;

export async function fillPdf(
  templatePath: string,
  fieldValues: Record<string, PdfFieldValue>,
  loadTemplate?: LoadTemplateBytes,
  fields?: PdfStampField[]
): Promise<FillPdfResult> {
  const templateBytes = loadTemplate
    ? await loadTemplate(templatePath)
    : await loadPdfBytes(templatePath);
  return fillPdfFromBytes(templateBytes, fieldValues, fields);
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
  filename: string,
  fields?: PdfStampField[]
): Promise<FillPdfResult> {
  const result = await fillPdf(templatePath, fieldValues, undefined, fields);
  downloadPdfBytes(result.pdfBytes, filename);
  return result;
}

export type OnboardingPacketEntry = {
  templatePath: string;
  values: Record<string, PdfFieldValue>;
  /** Pages to include in the merged packet (from page 1). Defaults to all template pages. */
  pageCount?: number;
  /** Optional field metadata from the browser; extracted from template when omitted. */
  fields?: PdfStampField[];
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
  options?: { appendPdfBytes?: Uint8Array[]; loadTemplate?: LoadTemplateBytes }
): Promise<OnboardingPacketResult> {
  const mergedDoc = await PDFDocument.create();
  const formResults: FillPdfResult[] = [];

  for (const entry of entries) {
    const loadTemplate = options?.loadTemplate;
    const templateBytes = loadTemplate
      ? await loadTemplate(entry.templatePath)
      : await loadPdfBytes(entry.templatePath);

    const result = await fillPdfFromBytes(templateBytes, entry.values, entry.fields);
    if (hasNonEmptyValues(entry.values) && result.filledCount === 0) {
      throw new Error(`Could not save field values into ${entry.templatePath}.`);
    }

    formResults.push(result);
    const filledDoc = await PDFDocument.load(result.pdfBytes, { ignoreEncryption: true });
    const totalPages = filledDoc.getPageCount();
    const pagesToInclude = Math.max(1, Math.min(entry.pageCount ?? totalPages, totalPages));
    const pageIndices = Array.from({ length: pagesToInclude }, (_, index) => index);
    const copiedPages = await mergedDoc.copyPages(filledDoc, pageIndices);
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
    pageCount: mergedDoc.getPageCount(),
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

// Re-export for callers that pass react-acroform fields from the browser.
export type { PdfStampField };
