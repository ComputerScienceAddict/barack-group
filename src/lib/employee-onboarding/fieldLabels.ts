import type { MessageKey } from "@/lib/employee-onboarding/i18n";
import {
  I9_CITIZENSHIP_CHECKBOXES,
  type RequiredFieldRules,
  isFieldValueFilled
} from "@/lib/employee-onboarding/requiredFields";
import { W4_FILING_STATUS_CHECKBOXES } from "@/lib/employee-onboarding/w4Fields";
import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";

export const CITIZENSHIP_GROUP_KEY = "__citizenship__";
export const W4_FILING_STATUS_GROUP_KEY = "__w4_filing_status__";

const PDF_FIELD_LABEL_KEYS: Record<string, MessageKey> = {
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": "fieldFirstName",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": "fieldLastName",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": "fieldAddress",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": "fieldCityStateZip",
  "topmostSubform[0].Page1[0].f1_05[0]": "fieldSsn",
  "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]": "fieldW4Step3a",
  "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]": "fieldW4Step3b",
  "topmostSubform[0].Page1[0].f1_08[0]": "fieldW4Step3Total",
  employee_signature_step5: "fieldEmployeeSignature",
  employee_date_step5: "fieldEmployeeDate",
  employee_signature_step5_sp: "fieldEmployeeSignature",
  employee_date_step5_sp: "fieldEmployeeDate",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": "fieldFirstName",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": "fieldLastName",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]": "fieldAddress",
  "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]": "fieldCityStateZip",
  "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]": "fieldW4Step3a",
  "topmostSubform[0].Page1[0].f1_07[0]": "fieldW4Step3b",
  "Last Name (Family Name)": "fieldLastName",
  "Last Name Family Name from Section 1": "fieldLastName",
  "First Name Given Name": "fieldFirstName",
  "First Name Given Name from Section 1": "fieldFirstName",
  "Middle initial if any from Section 1": "fieldFirstName",
  "Address Street Number and Name": "fieldAddress",
  "City or Town": "fieldCity",
  State: "fieldState",
  "ZIP Code": "fieldZip",
  "Date of Birth mmddyyyy": "fieldDob",
  "US Social Security Number": "fieldSsn",
  "Employees E-mail Address": "fieldEmail",
  "Telephone Number": "fieldPhone",
  "Signature of Employee": "fieldEmployeeSignature",
  "Today's Date mmddyyy": "fieldEmployeeDate",
  Text440: "fieldWorkerSignature",
  Text441: "fieldDateReceived",
  apellido: "fieldLastName",
  nombre: "fieldFirstName",
  numero_telefono: "fieldPhone",
  direccion: "fieldAddress",
  ciudad: "fieldCity",
  estado: "fieldState",
  codigo_postal: "fieldZip",
  firma_solicitante: "fieldEmployeeSignature",
  fecha_firma: "fieldEmployeeDate",
  last_name: "fieldLastName",
  first_name: "fieldFirstName",
  phone_number: "fieldPhone",
  address: "fieldAddress",
  city: "fieldCity",
  state: "fieldState",
  zip_code: "fieldZip",
  applicant_signature: "fieldEmployeeSignature",
  applicant_signature_date: "fieldEmployeeDate",
  date_of_application: "fieldApplicationDate",
  middle_initial: "fieldMiddleInitial",
  ssn: "fieldSsn",
  ssn_1: "fieldSsn",
  ssn_2: "fieldSsn",
  ssn_3: "fieldSsn",
  email_address: "fieldEmail",
  correo_electronico: "fieldEmail",
  fecha_solicitud: "fieldApplicationDate",
  inicial_segundo_nombre: "fieldMiddleInitial",
  emergencia_nombre_1: "fieldEmergencyName",
  emergencia_relacion_1: "fieldEmergencyRelationship",
  emergencia_telefono_1: "fieldPhone",
  emergencia_telefono_alterno_1: "fieldAltPhone",
  emergencia_nombre_2: "fieldEmergencyName",
  emergencia_relacion_2: "fieldEmergencyRelationship",
  emergencia_telefono_2: "fieldPhone",
  emergencia_telefono_alterno_2: "fieldAltPhone",
  emergency_1_full_name: "fieldEmergencyName",
  emergency_1_relationship: "fieldEmergencyRelationship",
  emergency_1_phone: "fieldPhone",
  emergency_1_alt_phone: "fieldAltPhone",
  emergency_2_full_name: "fieldEmergencyName",
  emergency_2_relationship: "fieldEmergencyRelationship",
  emergency_2_phone: "fieldPhone",
  emergency_2_alt_phone: "fieldAltPhone",
  entrevistado_por: "fieldInterviewedBy",
  fecha_entrevista: "fieldInterviewDate",
  puesto_ofrecido: "fieldPositionOffered",
  fecha_inicio: "fieldStartDate",
  notas: "fieldCompanyNotes",
  interviewed_by: "fieldInterviewedBy",
  company_date: "fieldInterviewDate",
  position_offered: "fieldPositionOffered",
  start_date: "fieldStartDate",
  company_notes: "fieldCompanyNotes",
  "nombre del empleado": "fieldWh153EmployeeName",
  "nombre del empleador": "fieldWh153EmployerName",
  "nombre del negocio": "fieldWh153BusinessName",
  fecha: "fieldWh153Date",
  renglon: "fieldWh153Line",
  "renglón": "fieldWh153Line",
  "Pago por Hora": "fieldWh153HourlyPay",
  "Por Pieza": "fieldWh153PiecePay",
  "Condiciones de bonos": "fieldWh153BonusTerms",
  "Condiciones de prestamos personales": "fieldWh153LoanTerms",
  "Condiciones de servicios de vivienda o cuidado de ninos": "fieldWh153HousingTerms",
  casilla: "fieldWh153Acknowledgment",
};

export type MissingFieldIssue = {
  fieldKey: string;
  labelKey: MessageKey;
  scrollTarget: string;
};

export function getMissingFieldIssues(
  rules: RequiredFieldRules,
  values: Record<string, PdfFieldValue>
): MissingFieldIssue[] {
  const issues: MissingFieldIssue[] = [];

  for (const fieldName of rules.validateFields) {
    const candidates = rules.validateFieldAliases?.[fieldName] ?? [fieldName];
    const filled = candidates.some((name) => isFieldValueFilled(values[name]));
    if (!filled) {
      const labelKey = PDF_FIELD_LABEL_KEYS[fieldName];
      if (!labelKey) continue;
      issues.push({
        fieldKey: fieldName,
        labelKey,
        scrollTarget:
          candidates.find((name) => name.includes("from Section 1")) ??
          candidates.find((name) => PDF_FIELD_LABEL_KEYS[name]) ??
          fieldName
      });
    }
  }

  for (const group of rules.labeledCheckboxGroups ?? []) {
    const anyChecked = group.fields.some((name) => values[name] === true);
    if (!anyChecked) {
      issues.push({
        fieldKey: group.groupKey,
        labelKey: group.labelKey,
        scrollTarget: group.fields[0],
      });
    }
  }

  for (const group of rules.checkboxGroups ?? []) {
    const anyChecked = group.some((name) => values[name] === true);
    if (!anyChecked) {
      const isW4Filing = group.some((name) =>
        (W4_FILING_STATUS_CHECKBOXES as readonly string[]).includes(name)
      );
      issues.push({
        fieldKey: isW4Filing ? W4_FILING_STATUS_GROUP_KEY : CITIZENSHIP_GROUP_KEY,
        labelKey: isW4Filing ? "fieldW4FilingStatus" : "fieldCitizenship",
        scrollTarget: group[0]
      });
    }
  }

  return issues;
}

export function getHighlightKeysForIssues(
  issues: MissingFieldIssue[],
  rules?: RequiredFieldRules
): string[] {
  const keys = new Set<string>();
  for (const issue of issues) {
    keys.add(issue.scrollTarget);
    if (issue.fieldKey === CITIZENSHIP_GROUP_KEY) {
      for (const box of I9_CITIZENSHIP_CHECKBOXES) {
        keys.add(box);
      }
    }
    if (issue.fieldKey === W4_FILING_STATUS_GROUP_KEY) {
      for (const box of W4_FILING_STATUS_CHECKBOXES) {
        keys.add(box);
      }
    }
    const labeledGroup = rules?.labeledCheckboxGroups?.find(
      (entry) => entry.groupKey === issue.fieldKey
    );
    if (labeledGroup) {
      for (const field of labeledGroup.fields) {
        keys.add(field);
      }
    }
  }
  return [...keys];
}
