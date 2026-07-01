import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import {
  EMPLOYMENT_ENGLISH_CONTACT_HIGHLIGHT_FIELDS,
  EMPLOYMENT_SPANISH_CONTACT_HIGHLIGHT_FIELDS,
  type LabeledCheckboxGroup,
  mergeHighlightFields,
} from "@/lib/employee-onboarding/contactFields";

/** AcroForm field names in janiking-employment-application-spanish.pdf */
export const EMPLOYMENT_SPANISH_FIELD_KEYS = [
  "fecha_solicitud",
  "apellido",
  "nombre",
  "inicial_segundo_nombre",
  "numero_telefono",
  "ssn_1",
  "ssn_2",
  "ssn_3",
  "direccion",
  "ciudad",
  "estado",
  "codigo_postal",
  "correo_electronico",
  "mayor_18_si",
  "mayor_18_no",
  "empleo_tiempo_completo",
  "empleo_medio_tiempo",
  "empleo_temporal",
  "empleo_por_llamada",
  "turno_dia",
  "turno_tarde",
  "turno_noche",
  "turno_fines_semana",
  "turno_cualquiera",
  "dispuesto_viajar_si",
  "dispuesto_viajar_no",
  "horas_extra_si",
  "horas_extra_no",
  "autorizado_trabajar_si",
  "autorizado_trabajar_no",
  "emergencia_nombre_1",
  "emergencia_relacion_1",
  "emergencia_telefono_1",
  "emergencia_telefono_alterno_1",
  "emergencia_nombre_2",
  "emergencia_relacion_2",
  "emergencia_telefono_2",
  "emergencia_telefono_alterno_2",
  "firma_solicitante",
  "fecha_firma",
  "entrevistado_por",
  "fecha_entrevista",
  "puesto_ofrecido",
  "fecha_inicio",
  "notas",
] as const;

/** AcroForm field names in janiking-employment-application-english.pdf */
export const EMPLOYMENT_ENGLISH_FIELD_KEYS = [
  "date_of_application",
  "last_name",
  "first_name",
  "middle_initial",
  "phone_number",
  "ssn",
  "address",
  "city",
  "state",
  "zip_code",
  "email_address",
  "age_18_yes",
  "age_18_no",
  "position_full_time",
  "position_part_time",
  "position_temporary",
  "position_on_call",
  "shift_day",
  "shift_afternoon",
  "shift_night",
  "shift_weekends",
  "shift_any",
  "travel_yes",
  "travel_no",
  "overtime_yes",
  "overtime_no",
  "authorized_yes",
  "authorized_no",
  "emergency_1_full_name",
  "emergency_1_relationship",
  "emergency_1_phone",
  "emergency_1_alt_phone",
  "emergency_2_full_name",
  "emergency_2_relationship",
  "emergency_2_phone",
  "emergency_2_alt_phone",
  "applicant_signature",
  "applicant_signature_date",
  "interviewed_by",
  "company_date",
  "position_offered",
  "start_date",
  "company_notes",
] as const;

const EMPLOYMENT_ENGLISH_CHECKBOX_FIELDS = new Set([
  "age_18_yes",
  "age_18_no",
  "position_full_time",
  "position_part_time",
  "position_temporary",
  "position_on_call",
  "shift_day",
  "shift_afternoon",
  "shift_night",
  "shift_weekends",
  "shift_any",
  "travel_yes",
  "travel_no",
  "overtime_yes",
  "overtime_no",
  "authorized_yes",
  "authorized_no",
]);

const EMPLOYMENT_SPANISH_CHECKBOX_FIELDS = new Set([
  "mayor_18_si",
  "mayor_18_no",
  "empleo_tiempo_completo",
  "empleo_medio_tiempo",
  "empleo_temporal",
  "empleo_por_llamada",
  "turno_dia",
  "turno_tarde",
  "turno_noche",
  "turno_fines_semana",
  "turno_cualquiera",
  "dispuesto_viajar_si",
  "dispuesto_viajar_no",
  "horas_extra_si",
  "horas_extra_no",
  "autorizado_trabajar_si",
  "autorizado_trabajar_no",
]);

const EMPLOYMENT_ENGLISH_CHECKBOX_GROUPS: LabeledCheckboxGroup[] = [
  {
    groupKey: "__employment_age_18__",
    fields: ["age_18_yes", "age_18_no"],
    labelKey: "fieldEmploymentAge18",
  },
  {
    groupKey: "__employment_position__",
    fields: ["position_full_time", "position_part_time", "position_temporary", "position_on_call"],
    labelKey: "fieldEmploymentPosition",
  },
  {
    groupKey: "__employment_shift__",
    fields: ["shift_day", "shift_afternoon", "shift_night", "shift_weekends", "shift_any"],
    labelKey: "fieldEmploymentShift",
  },
  {
    groupKey: "__employment_travel__",
    fields: ["travel_yes", "travel_no"],
    labelKey: "fieldEmploymentTravel",
  },
  {
    groupKey: "__employment_overtime__",
    fields: ["overtime_yes", "overtime_no"],
    labelKey: "fieldEmploymentOvertime",
  },
  {
    groupKey: "__employment_authorized__",
    fields: ["authorized_yes", "authorized_no"],
    labelKey: "fieldEmploymentWorkAuth",
  },
];

const EMPLOYMENT_SPANISH_CHECKBOX_GROUPS: LabeledCheckboxGroup[] = [
  {
    groupKey: "__employment_age_18__",
    fields: ["mayor_18_si", "mayor_18_no"],
    labelKey: "fieldEmploymentAge18",
  },
  {
    groupKey: "__employment_position__",
    fields: [
      "empleo_tiempo_completo",
      "empleo_medio_tiempo",
      "empleo_temporal",
      "empleo_por_llamada",
    ],
    labelKey: "fieldEmploymentPosition",
  },
  {
    groupKey: "__employment_shift__",
    fields: [
      "turno_dia",
      "turno_tarde",
      "turno_noche",
      "turno_fines_semana",
      "turno_cualquiera",
    ],
    labelKey: "fieldEmploymentShift",
  },
  {
    groupKey: "__employment_travel__",
    fields: ["dispuesto_viajar_si", "dispuesto_viajar_no"],
    labelKey: "fieldEmploymentTravel",
  },
  {
    groupKey: "__employment_overtime__",
    fields: ["horas_extra_si", "horas_extra_no"],
    labelKey: "fieldEmploymentOvertime",
  },
  {
    groupKey: "__employment_authorized__",
    fields: ["autorizado_trabajar_si", "autorizado_trabajar_no"],
    labelKey: "fieldEmploymentWorkAuth",
  },
];

function employmentTextValidateFields(
  allKeys: readonly string[],
  checkboxFields: Set<string>
): string[] {
  return allKeys.filter((key) => !checkboxFields.has(key));
}

export const employmentSpanishRequiredRules: RequiredFieldRules = {
  highlightFields: mergeHighlightFields(
    EMPLOYMENT_SPANISH_FIELD_KEYS,
    EMPLOYMENT_SPANISH_CONTACT_HIGHLIGHT_FIELDS
  ),
  validateFields: employmentTextValidateFields(
    EMPLOYMENT_SPANISH_FIELD_KEYS,
    EMPLOYMENT_SPANISH_CHECKBOX_FIELDS
  ),
  labeledCheckboxGroups: EMPLOYMENT_SPANISH_CHECKBOX_GROUPS,
};

export const employmentEnglishRequiredRules: RequiredFieldRules = {
  highlightFields: mergeHighlightFields(
    EMPLOYMENT_ENGLISH_FIELD_KEYS,
    EMPLOYMENT_ENGLISH_CONTACT_HIGHLIGHT_FIELDS
  ),
  validateFields: employmentTextValidateFields(
    EMPLOYMENT_ENGLISH_FIELD_KEYS,
    EMPLOYMENT_ENGLISH_CHECKBOX_FIELDS
  ),
  labeledCheckboxGroups: EMPLOYMENT_ENGLISH_CHECKBOX_GROUPS,
};

/** @deprecated Use getEmploymentRequiredRules(locale) */
export const employmentRequiredRules = employmentSpanishRequiredRules;

export function getEmploymentRequiredRules(locale: Locale): RequiredFieldRules {
  return locale === "es" ? employmentSpanishRequiredRules : employmentEnglishRequiredRules;
}
