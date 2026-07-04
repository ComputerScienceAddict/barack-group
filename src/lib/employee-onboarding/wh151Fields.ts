import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";

/** Tall click-to-sign box in the Firma del trabajador / worker signature zone. */
export const WH151_SIGNATURE_FIELD = "WorkerSignature";

/** Printed worker name line below the signature (Nombre del trabajador, en letra de molde). */
export const WH151_PRINTED_NAME_FIELD = "Text440";

export const WH151_DATE_FIELD = "Text441";

/** Employer-only fields — not shown to applicants. */
export const WH151_HIDDEN_OVERLAY_FIELDS = [
  "ContractorSignature",
  "Check Box442",
] as const;

export const WH151_HIGHLIGHT_FIELDS = [
  WH151_SIGNATURE_FIELD,
  WH151_PRINTED_NAME_FIELD,
  WH151_DATE_FIELD,
] as const;

export const WH151_VALIDATE_FIELDS = WH151_HIGHLIGHT_FIELDS;

export const wh151RequiredRules: RequiredFieldRules = {
  highlightFields: WH151_HIGHLIGHT_FIELDS,
  hiddenOverlayFields: WH151_HIDDEN_OVERLAY_FIELDS,
  highlightPages: [2],
  validateFields: WH151_VALIDATE_FIELDS,
};
