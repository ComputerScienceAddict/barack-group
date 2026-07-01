import {
  EMPTY_APPLICANT_NAME,
  normalizeApplicantName,
  type ApplicantName,
} from "@/lib/employee-onboarding/applicantName";
import {
  EMPTY_DIRECT_DEPOSIT_VALUES,
  normalizeDirectDepositValues,
  type DirectDepositValues,
} from "@/lib/employee-onboarding/directDeposit";
import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import {
  NAME_ENTRY_STEP,
  SUBMIT_STEP,
  type OnboardingFormId,
} from "@/lib/employee-onboarding/pdfForms";

export const STORAGE_VERSION = "16";
export const DRAFT_KEY = "newHireOnboardingDraft";
export const PACKET_KEY = "newHireOnboardingPacket";
export const VERSION_KEY = "newHireOnboardingVersion";

export type FormValuesState = Record<OnboardingFormId, Record<string, PdfFieldValue>>;

export const EMPTY_FORM_VALUES: FormValuesState = {
  employment: {},
  w4: {},
  i9: {},
  wh151: {},
};

export type DraftSnapshot = {
  formValues: FormValuesState;
  directDepositValues: DirectDepositValues;
  applicantName: ApplicantName;
  step: number;
  draftRestored: boolean;
};

export function clearStoredOnboardingData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
  window.localStorage.removeItem(PACKET_KEY);
  window.localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
}

export function readDraftSnapshot(): DraftSnapshot {
  const defaults: DraftSnapshot = {
    formValues: EMPTY_FORM_VALUES,
    directDepositValues: EMPTY_DIRECT_DEPOSIT_VALUES,
    applicantName: EMPTY_APPLICANT_NAME,
    step: NAME_ENTRY_STEP,
    draftRestored: false,
  };

  if (typeof window === "undefined") return defaults;

  const savedVersion = window.localStorage.getItem(VERSION_KEY);
  if (savedVersion !== STORAGE_VERSION) {
    clearStoredOnboardingData();
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaults;

    const draft = JSON.parse(raw) as {
      formValues?: FormValuesState;
      directDepositValues?: DirectDepositValues;
      applicantName?: ApplicantName;
      step?: number;
    };
    const restoredFormValues = draft.formValues ?? EMPTY_FORM_VALUES;

    return {
      formValues: restoredFormValues,
      directDepositValues: draft.directDepositValues
        ? normalizeDirectDepositValues(draft.directDepositValues)
        : EMPTY_DIRECT_DEPOSIT_VALUES,
      applicantName: draft.applicantName
        ? normalizeApplicantName(draft.applicantName)
        : EMPTY_APPLICANT_NAME,
      step:
        typeof draft.step === "number" && draft.step >= 0 && draft.step <= SUBMIT_STEP
          ? draft.step
          : NAME_ENTRY_STEP,
      draftRestored: true,
    };
  } catch {
    return defaults;
  }
}
