const DRAWN_SIGNATURE_PREFIX = "__drawn_signature__:";

export const PDF_SIGNATURE_FIELD_NAMES = new Set<string>([
  "employee_signature_step5",
  "employee_signature_step5_sp",
  "applicant_signature",
  "firma_solicitante",
  "Signature of Employee",
  "WorkerSignature",
]);

/** Cramped employment applicant signature lines — expand for click-to-sign UI + PDF stamp. */
export const EMPLOYMENT_APPLICANT_SIGNATURE_FIELDS = new Set<string>([
  "applicant_signature",
  "firma_solicitante",
]);

export const EMPLOYMENT_APPLICANT_SIGNATURE_MIN_HEIGHT_PT = 42;

/** I-9 employee signature — expand to fill the visible row (widget rect is just the line). */
export const I9_EMPLOYEE_SIGNATURE_FIELD = "Signature of Employee";
export const I9_SIGNATURE_MIN_HEIGHT_PT = 22;

export function expandSignatureFieldRect(
  fieldName: string,
  rect: readonly [number, number, number, number]
): [number, number, number, number] {
  const left = Math.min(rect[0], rect[2]);
  const right = Math.max(rect[0], rect[2]);
  const bottom = Math.min(rect[1], rect[3]);
  const top = Math.max(rect[1], rect[3]);
  const height = top - bottom;

  // I-9: expand upward so the stamp fills the visible "Signature of Employee" row.
  if (fieldName === I9_EMPLOYEE_SIGNATURE_FIELD) {
    if (height >= I9_SIGNATURE_MIN_HEIGHT_PT) return [left, bottom, right, top];
    return [left, bottom, right, bottom + I9_SIGNATURE_MIN_HEIGHT_PT];
  }

  if (!EMPLOYMENT_APPLICANT_SIGNATURE_FIELDS.has(fieldName)) {
    return [left, bottom, right, top];
  }

  if (height >= EMPLOYMENT_APPLICANT_SIGNATURE_MIN_HEIGHT_PT) {
    return [left, bottom, right, top];
  }

  return [left, bottom, right, bottom + EMPLOYMENT_APPLICANT_SIGNATURE_MIN_HEIGHT_PT];
}

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
