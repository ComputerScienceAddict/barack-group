import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";

/** AcroForm field names in janiking-employment-application-spanish.pdf */
export const EMPLOYMENT_FIELD_KEYS = [
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
  "notas"
] as const;

export type EmploymentFieldKey = (typeof EMPLOYMENT_FIELD_KEYS)[number];

export const employmentRequiredRules: RequiredFieldRules = {
  highlightFields: [
    "apellido",
    "nombre",
    "numero_telefono",
    "direccion",
    "ciudad",
    "estado",
    "codigo_postal",
    "firma_solicitante",
    "fecha_firma"
  ],
  validateFields: ["apellido", "nombre", "numero_telefono", "firma_solicitante", "fecha_firma"]
};
