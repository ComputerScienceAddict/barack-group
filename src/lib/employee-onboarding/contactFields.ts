import type { MessageKey } from "@/lib/employee-onboarding/i18n";

/** PDF field names for email / phone contact info, merged into each form's yellow highlights. */
export const I9_CONTACT_HIGHLIGHT_FIELDS = [
  "Employees E-mail Address",
  "Telephone Number",
] as const;

export const EMPLOYMENT_ENGLISH_CONTACT_HIGHLIGHT_FIELDS = [
  "phone_number",
  "email_address",
  "emergency_1_phone",
  "emergency_1_alt_phone",
  "emergency_2_phone",
  "emergency_2_alt_phone",
] as const;

export const EMPLOYMENT_SPANISH_CONTACT_HIGHLIGHT_FIELDS = [
  "numero_telefono",
  "correo_electronico",
  "emergencia_telefono_1",
  "emergencia_telefono_alterno_1",
  "emergencia_telefono_2",
  "emergencia_telefono_alterno_2",
] as const;

export function mergeHighlightFields(
  base: readonly string[],
  extra: readonly string[]
): string[] {
  return [...new Set([...base, ...extra])];
}

export type LabeledCheckboxGroup = {
  groupKey: string;
  fields: readonly string[];
  labelKey: MessageKey;
};
