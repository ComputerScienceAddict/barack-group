import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import type { RequiredFieldRules } from "@/lib/employee-onboarding/requiredFields";
import {
  getMissingRequiredFields,
  i9RequiredRules,
  w4RequiredRules,
  wh151RequiredRules
} from "@/lib/employee-onboarding/requiredFields";
import { employmentRequiredRules } from "@/lib/employee-onboarding/employmentFields";
import { wh153RequiredRules } from "@/lib/employee-onboarding/wh153Fields";

export type PdfFormKind = "fillable";

export type PdfFormConfig = {
  id: string;
  title: string;
  templatePath: string;
  downloadFilename: string;
  pageCount: number;
  kind: PdfFormKind;
  requiredRules: RequiredFieldRules;
};

export const ONBOARDING_PACKET_FILENAME = "new-hire-onboarding-packet.pdf";

export const employmentFormConfig: PdfFormConfig = {
  id: "employment",
  title: "JaniKing Employment Application (Spanish)",
  templatePath: "/documents/janiking-employment-application-spanish.pdf",
  downloadFilename: "janiking-employment-application-filled.pdf",
  pageCount: 1,
  kind: "fillable",
  requiredRules: employmentRequiredRules
};

export const w4FormConfig: PdfFormConfig = {
  id: "w4",
  title: "Form W-4",
  templatePath: "/documents/w-4.pdf",
  downloadFilename: "w-4-filled.pdf",
  pageCount: 5,
  kind: "fillable",
  requiredRules: w4RequiredRules
};

export const i9FormConfig: PdfFormConfig = {
  id: "i9",
  title: "Form I-9",
  templatePath: "/documents/i-9.pdf",
  downloadFilename: "i-9-filled.pdf",
  pageCount: 4,
  kind: "fillable",
  requiredRules: i9RequiredRules
};

export const wh151FormConfig: PdfFormConfig = {
  id: "wh151",
  title: "WH-151PS Michigan Withholding",
  templatePath: "/documents/wh-151ps-2024.pdf",
  downloadFilename: "wh-151ps-filled.pdf",
  pageCount: 2,
  kind: "fillable",
  requiredRules: wh151RequiredRules
};

export const wh153FormConfig: PdfFormConfig = {
  id: "wh153",
  title: "WH-153S Wage Notice",
  templatePath: "/documents/wh-153s-2024.pdf",
  downloadFilename: "wh-153s-filled.pdf",
  pageCount: 2,
  kind: "fillable",
  requiredRules: wh153RequiredRules,
};

export const ONBOARDING_FORM_CONFIGS = [
  employmentFormConfig,
  w4FormConfig,
  i9FormConfig,
  wh151FormConfig,
  wh153FormConfig,
] as const;

export type OnboardingFormId = (typeof ONBOARDING_FORM_CONFIGS)[number]["id"];

export const NAME_ENTRY_STEP = 0;
export const FORM_START_STEP = 1;
export const DIRECT_DEPOSIT_STEP = FORM_START_STEP + ONBOARDING_FORM_CONFIGS.length;
export const SUBMIT_STEP = DIRECT_DEPOSIT_STEP + 1;
export const TOTAL_STEPS = SUBMIT_STEP + 1;

export function isFormStep(step: number): boolean {
  return step >= FORM_START_STEP && step < DIRECT_DEPOSIT_STEP;
}

export function getFormStepIndex(step: number): number {
  return step - FORM_START_STEP;
}

export type ProfilePrefill = {
  legalName: string;
  preferredName: string;
  email: string;
  startDate: string;
};

function splitLegalName(legalName: string) {
  const parts = legalName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleInitial: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleInitial: "", lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], middleInitial: "", lastName: parts[1] };
  return {
    firstName: parts[0],
    middleInitial: parts[1].length === 1 ? parts[1] : "",
    lastName: parts.length === 3 && parts[1].length === 1 ? parts[2] : parts.slice(1).join(" ")
  };
}

function formatTodayMmDdYyyy() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}/${day}/${year}`;
}

export function buildI9Prefill(profile: ProfilePrefill): Record<string, PdfFieldValue> {
  const { firstName, middleInitial, lastName } = splitLegalName(profile.legalName);
  const values: Record<string, PdfFieldValue> = {
    "Last Name Family Name from Section 1": lastName,
    "First Name Given Name": firstName,
    "First Name Given Name from Section 1": firstName,
    "Middle initial if any from Section 1": middleInitial,
    "Employee Middle Initial (if any)": middleInitial,
    "Today's Date mmddyyy": formatTodayMmDdYyyy()
  };

  if (profile.preferredName) {
    values["Employee Other Last Names Used (if any)"] = profile.preferredName;
  }

  return values;
}

export function isPdfFormComplete(
  config: PdfFormConfig,
  fieldValues: Record<string, PdfFieldValue>
): boolean {
  return getMissingRequiredFields(config.requiredRules, fieldValues).length === 0;
}
