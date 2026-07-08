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
  TUTORIAL_STEP,
  SUBMIT_STEP,
  type OnboardingFormId,
} from "@/lib/employee-onboarding/pdfForms";

export const STORAGE_VERSION = "17";
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

function getStoredItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode / blocked storage).
  }
}

function removeStoredItem(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures (private mode / blocked storage).
  }
}

export function clearStoredOnboardingData() {
  removeStoredItem(DRAFT_KEY);
  removeStoredItem(PACKET_KEY);
  setStoredItem(VERSION_KEY, STORAGE_VERSION);
}

export function readDraftSnapshot(): DraftSnapshot {
  const defaults: DraftSnapshot = {
    formValues: EMPTY_FORM_VALUES,
    directDepositValues: EMPTY_DIRECT_DEPOSIT_VALUES,
    applicantName: EMPTY_APPLICANT_NAME,
    step: TUTORIAL_STEP,
    draftRestored: false,
  };

  if (typeof window === "undefined") return defaults;

  const savedVersion = getStoredItem(VERSION_KEY);
  if (savedVersion !== STORAGE_VERSION) {
    clearStoredOnboardingData();
    return defaults;
  }

  try {
    const raw = getStoredItem(DRAFT_KEY);
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
          : TUTORIAL_STEP,
      draftRestored: true,
    };
  } catch {
    return defaults;
  }
}
