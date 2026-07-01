import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";

/** WH-153S employee / wage notice fields to highlight in yellow. */
export const WH153_HIGHLIGHT_FIELDS = [
  "nombre del empleado",
  "nombre del empleador",
  "nombre del negocio",
  "fecha",
  "renglon",
  "renglón",
  "Pago por Hora",
  "Por Pieza",
  "Condiciones de bonos",
  "Condiciones de prestamos personales",
  "Condiciones de servicios de vivienda o cuidado de ninos",
  "casilla",
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
  validateFields: WH153_VALIDATE_FIELDS,
  validateFieldAliases: WH153_VALIDATE_FIELD_ALIASES,
};
