const DRAWN_SIGNATURE_PREFIX = "__drawn_signature__:";

export const PDF_SIGNATURE_FIELD_NAMES = new Set<string>([
  "employee_signature_step5",
  "employee_signature_step5_sp",
  "applicant_signature",
  "firma_solicitante",
  "Signature of Employee",
  "Text440",
]);

export function isPdfSignatureField(fieldName: string): boolean {
  return PDF_SIGNATURE_FIELD_NAMES.has(fieldName);
}

export function encodeDrawnSignature(dataUrl: string): string {
  return `${DRAWN_SIGNATURE_PREFIX}${dataUrl}`;
}

export function decodeDrawnSignature(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith(DRAWN_SIGNATURE_PREFIX)) return null;
  const payload = value.slice(DRAWN_SIGNATURE_PREFIX.length).trim();
  return payload.length > 0 ? payload : null;
}
