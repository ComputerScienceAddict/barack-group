import type { MessageKey } from "@/lib/employee-onboarding/i18n";
import {
  I9_CITIZENSHIP_CHECKBOXES,
  W4_FILING_STATUS_CHECKBOXES,
  type RequiredFieldRules,
  isFieldValueFilled
} from "@/lib/employee-onboarding/requiredFields";
import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";

export const CITIZENSHIP_GROUP_KEY = "__citizenship__";
export const W4_FILING_STATUS_GROUP_KEY = "__w4_filing_status__";

const PDF_FIELD_LABEL_KEYS: Record<string, MessageKey> = {
  "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": "fieldFirstName",
  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": "fieldLastName",
  "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": "fieldAddress",
  "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": "fieldCityStateZip",
  "topmostSubform[0].Page1[0].f1_05[0]": "fieldSsn",
  "topmostSubform[0].Page1[0].f1_13[0]": "fieldEmployeeSignature",
  "topmostSubform[0].Page1[0].f1_14[0]": "fieldEmployeeDate",
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
  fecha_firma: "fieldEmployeeDate"
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

export function getHighlightKeysForIssues(issues: MissingFieldIssue[]): string[] {
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
  }
  return [...keys];
}
