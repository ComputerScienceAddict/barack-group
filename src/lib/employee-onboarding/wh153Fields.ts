import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";

/** WH-153S disclosure block (page 2) — printed name, signature line, date. */
export const WH153_HIGHLIGHT_FIELDS = [
  "nombre del empleado",
  "fecha",
  "renglon",
  "renglón",
] as const;

export const WH153_VALIDATE_FIELDS = [
  "nombre del empleado",
  "nombre del empleador",
  "fecha",
  "casilla",
] as const;

export const WH153_VALIDATE_FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  renglon: ["renglon", "renglón"],
};

export const wh153RequiredRules: RequiredFieldRules = {
  highlightFields: WH153_HIGHLIGHT_FIELDS,
  highlightPages: [2],
  validateFields: WH153_VALIDATE_FIELDS,
  validateFieldAliases: WH153_VALIDATE_FIELD_ALIASES,
};
