"use client";

import "@/lib/employee-onboarding/configurePdfWorker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FillablePdfForm, { type FillablePdfFormHandle } from "@/components/employee-onboarding/FillablePdfForm";
import NameEntryStep from "@/components/employee-onboarding/NameEntryStep";
import OnboardingStepNav from "@/components/employee-onboarding/OnboardingStepNav";
import DirectDepositForm, {
  EMPTY_DIRECT_DEPOSIT_VALUES,
  type DirectDepositFormHandle
} from "@/components/employee-onboarding/DirectDepositForm";
import { LanguageProvider, useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import type { MissingFieldIssue } from "@/lib/employee-onboarding/fieldLabels";
import { getHighlightKeysForIssues, getMissingFieldIssues } from "@/lib/employee-onboarding/fieldLabels";
import type { MessageKey } from "@/lib/employee-onboarding/i18n";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import { pdfFieldValuesEqual, mergePdfFieldValues } from "@/lib/employee-onboarding/pdfFieldValues";
import { normalizeI9FormValues } from "@/lib/employee-onboarding/requiredFields";
import {
  DIRECT_DEPOSIT_STEP,
  FORM_START_STEP,
  NAME_ENTRY_STEP,
  ONBOARDING_FORM_CONFIGS,
  ONBOARDING_PACKET_FILENAME,
  SUBMIT_STEP,
  TUTORIAL_STEP,
  TOTAL_STEPS,
  getFormStepIndex,
  getOnboardingFormConfigs,
  isFormStep,
  type OnboardingFormId,
  type PdfFormConfig
} from "@/lib/employee-onboarding/pdfForms";
import { buildDirectDepositPdfBytes, getMissingDirectDepositIssues, usesDirectDeposit, type DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import { buildOnboardingPacket, downloadPdfBytes } from "@/lib/employee-onboarding/fillPdf";
import {
  EMPTY_APPLICANT_NAME,
  isApplicantNameComplete,
  normalizeApplicantName,
  type ApplicantName,
} from "@/lib/employee-onboarding/applicantName";
import {
  clearStoredOnboardingData,
  EMPTY_FORM_VALUES,
  readDraftSnapshot,
  DRAFT_KEY,
  PACKET_KEY,
  type FormValuesState,
} from "@/lib/employee-onboarding/loadDraft";
import { mirrorW4FieldValues } from "@/lib/employee-onboarding/w4Fields";
import { mirrorEmploymentFieldValues } from "@/lib/employee-onboarding/employmentFields";
import { decodeDrawnSignature } from "@/lib/employee-onboarding/signatureFields";

const PACKET_SUMMARY_KEYS: MessageKey[] = [
  "packetItemEmployment",
  "packetItemW4",
  "packetItemI9",
  "packetItemWh151",
  "packetItemDirectDeposit",
];

const TUTORIAL_STEP_KEYS: MessageKey[] = [
  "tutorialStep1",
  "tutorialStep2",
  "tutorialStep3",
  "tutorialStep4",
  "tutorialStep5",
  "tutorialStep6",
];

const FORM_TITLE_KEYS: Record<OnboardingFormId, MessageKey> = {
  employment: "formEmployment",
  w4: "formW4",
  i9: "formI9",
  wh151: "formWh151",
};

const SIGNATURE_FIELD_KEYS_BY_FORM: Record<OnboardingFormId, readonly string[]> = {
  employment: ["applicant_signature", "firma_solicitante"],
  w4: ["employee_signature_step5", "employee_signature_step5_sp"],
  i9: ["Signature of Employee"],
  wh151: ["WorkerSignature"],
};

function getInitialOnboardingState() {
  if (typeof window === "undefined") {
    return {
      formValues: EMPTY_FORM_VALUES,
      directDepositValues: EMPTY_DIRECT_DEPOSIT_VALUES,
      applicantName: EMPTY_APPLICANT_NAME,
      step: TUTORIAL_STEP,
      showDraftRestoredNotice: false,
    };
  }

  const draft = readDraftSnapshot();
  return {
    formValues: draft.formValues,
    directDepositValues: draft.directDepositValues,
    applicantName: draft.applicantName,
    step: draft.step,
    showDraftRestoredNotice: draft.draftRestored,
  };
}

function safeSetLocalStorageItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures to keep onboarding usable on restricted mobile browsers.
  }
}

function findFirstCapturedSignature(values: FormValuesState): string | null {
  for (const formId of Object.keys(SIGNATURE_FIELD_KEYS_BY_FORM) as OnboardingFormId[]) {
    for (const key of SIGNATURE_FIELD_KEYS_BY_FORM[formId]) {
      const encoded = String(values[formId][key] ?? "");
      if (decodeDrawnSignature(encoded)) return encoded;
    }
  }
  return null;
}

function applyCapturedSignatureToAllForms(
  current: FormValuesState,
  encodedSignature: string
): FormValuesState {
  let changed = false;
  const next: FormValuesState = {
    employment: { ...current.employment },
    w4: { ...current.w4 },
    i9: { ...current.i9 },
    wh151: { ...current.wh151 },
  };

  for (const formId of Object.keys(SIGNATURE_FIELD_KEYS_BY_FORM) as OnboardingFormId[]) {
    for (const key of SIGNATURE_FIELD_KEYS_BY_FORM[formId]) {
      const existingValue = String(next[formId][key] ?? "");
      if (decodeDrawnSignature(existingValue)) continue;
      next[formId][key] = encodedSignature;
      changed = true;
    }
  }

  return changed ? next : current;
}

function applyApplicantPrefill(
  current: FormValuesState,
  name: ApplicantName
): FormValuesState {
  const fullName = [name.firstName, name.lastName].filter(Boolean).join(" ");
  const employmentPrefill: Record<string, PdfFieldValue> = {
    first_name: name.firstName,
    last_name: name.lastName,
    nombre: name.firstName,
    apellido: name.lastName,
  };

  const today = (() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${d.getFullYear()}`;
  })();

  const w4Prefill: Record<string, PdfFieldValue> = {
    "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": name.firstName,
    "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": name.lastName,
    "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": name.firstName,
    "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": name.lastName,
    employee_date_step5: today,
    employee_date_step5_sp: today,
  };

  return {
    ...current,
    employment: {
      ...current.employment,
      ...employmentPrefill,
    },
    w4: {
      ...current.w4,
      ...w4Prefill,
    },
    wh151: {
      ...current.wh151,
      Text440: fullName,
      "nombre del empleado": fullName,
    },
    i9: {
      ...current.i9,
      "First Name Given Name from Section 1": name.firstName,
      "First Name Given Name": name.firstName,
      "Last Name Family Name from Section 1": name.lastName,
      "Last Name (Family Name)": name.lastName,
      "Employee Middle Initial (if any)": "",
      "Middle initial if any from Section 1": "",
    },
  };
}

export default function OnboardingApp() {
  return (
    <LanguageProvider>
      <OnboardingAppContent />
    </LanguageProvider>
  );
}

function OnboardingAppContent() {
  const { locale, setLocale, t } = useLanguage();
  const formConfigs = useMemo(() => getOnboardingFormConfigs(locale), [locale]);
  const initialOnboardingState = useMemo(() => getInitialOnboardingState(), []);
  const [step, setStep] = useState(initialOnboardingState.step);
  const [formValues, setFormValues] = useState<FormValuesState>(initialOnboardingState.formValues);
  const [directDepositValues, setDirectDepositValues] = useState<DirectDepositValues>(
    initialOnboardingState.directDepositValues
  );
  const [applicantName, setApplicantName] = useState<ApplicantName>(initialOnboardingState.applicantName);
  const [nameMissingKeys, setNameMissingKeys] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [showDraftRestoredNotice, setShowDraftRestoredNotice] = useState(
    initialOnboardingState.showDraftRestoredNotice
  );
  const [draftHydrated] = useState(() => typeof window !== "undefined");
  const [missingIssues, setMissingIssues] = useState<MissingFieldIssue[]>([]);
  const [missingFormStep, setMissingFormStep] = useState<number | null>(null);
  const pendingFocusRef = useRef<{ step: number; highlightKeys: string[]; scrollTarget: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [formSession, setFormSession] = useState(0);
  const formContentRef = useRef<HTMLElement>(null);
  const employmentFormRef = useRef<FillablePdfFormHandle>(null);
  const w4FormRef = useRef<FillablePdfFormHandle>(null);
  const i9FormRef = useRef<FillablePdfFormHandle>(null);
  const wh151FormRef = useRef<FillablePdfFormHandle>(null);
  const directDepositFormRef = useRef<DirectDepositFormHandle>(null);

  const getConfigForStep = useCallback(
    (formStep: number): PdfFormConfig | null => {
      if (!isFormStep(formStep)) return null;
      return formConfigs[getFormStepIndex(formStep)] ?? null;
    },
    [formConfigs]
  );

  const updateFormValues = useCallback((formId: OnboardingFormId, values: Record<string, PdfFieldValue>) => {
    setFormValues((prev) => {
      if (pdfFieldValuesEqual(prev[formId], values)) return prev;
      const merged = { ...prev, [formId]: values };
      const firstSignature = findFirstCapturedSignature(merged);
      if (!firstSignature) return merged;
      return applyCapturedSignatureToAllForms(merged, firstSignature);
    });
  }, []);

  const updateEmploymentValues = useCallback(
    (values: Record<string, PdfFieldValue>) => {
      updateFormValues("employment", mirrorEmploymentFieldValues(values));
    },
    [updateFormValues]
  );

  const updateW4Values = useCallback(
    (values: Record<string, PdfFieldValue>) => {
      updateFormValues("w4", mirrorW4FieldValues(values, locale));
    },
    [locale, updateFormValues]
  );
  const updateI9Values = useCallback(
    (values: Record<string, PdfFieldValue>) => updateFormValues("i9", values),
    [updateFormValues]
  );
  const updateWh151Values = useCallback(
    (values: Record<string, PdfFieldValue>) => updateFormValues("wh151", values),
    [updateFormValues]
  );

  function getFormRef(formId: OnboardingFormId) {
    if (formId === "employment") return employmentFormRef;
    if (formId === "w4") return w4FormRef;
    if (formId === "i9") return i9FormRef;
    if (formId === "wh151") return wh151FormRef;
    return null;
  }

  function getStampFieldsForForm(formId: OnboardingFormId) {
    return getFormRef(formId)?.current?.getStampFields() ?? [];
  }

  function flushStepValues(formStep: number): Record<string, PdfFieldValue> {
    const config = getConfigForStep(formStep);
    if (!config) return {};
    const ref = getFormRef(config.id);
    const flushed = ref?.current?.flushValues() ?? formValues[config.id];
    const merged = mergePdfFieldValues(formValues[config.id], flushed);
    if (config.id === "i9") return normalizeI9FormValues(merged);
    return merged;
  }

  useEffect(() => {
    formContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function focusStepMissing(formStep: number, scrollTarget: string, highlightKeys: string[]) {
    if (formStep === DIRECT_DEPOSIT_STEP) {
      directDepositFormRef.current?.focusMissingFields(highlightKeys);
      return;
    }

    const config = getConfigForStep(formStep);
    const formRef = config ? getFormRef(config.id) : null;
    formRef?.current?.focusMissingFields(highlightKeys);
  }

  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending || step !== pending.step) return;

    const timer = window.setTimeout(() => {
      focusStepMissing(pending.step, pending.scrollTarget, pending.highlightKeys);
      pendingFocusRef.current = null;
    }, 150);

    return () => window.clearTimeout(timer);
    // focusStepMissing uses refs; only re-run when navigation step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!draftHydrated) return;
    safeSetLocalStorageItem(
      DRAFT_KEY,
      JSON.stringify({
        formValues,
        directDepositValues,
        applicantName,
        step,
        savedAt: new Date().toISOString(),
      })
    );
  }, [applicantName, directDepositValues, draftHydrated, formValues, step]);

  function handleLocaleChange(next: Locale) {
    if (next === locale) return;
    setFormValues((prev) => ({
      ...prev,
      employment: mirrorEmploymentFieldValues(prev.employment),
      w4: mirrorW4FieldValues(prev.w4, next),
    }));
    setLocale(next);
    const w4Step = FORM_START_STEP + 1;
    if (step === FORM_START_STEP || step === w4Step) {
      setFormSession((current) => current + 1);
    }
  }

  function clearMissingMarks() {
    employmentFormRef.current?.clearMissingMarks();
    w4FormRef.current?.clearMissingMarks();
    i9FormRef.current?.clearMissingMarks();
    wh151FormRef.current?.clearMissingMarks();
    directDepositFormRef.current?.clearMissingMarks();
  }

  function hardReset() {
    clearStoredOnboardingData();
    setFormValues(EMPTY_FORM_VALUES);
    setDirectDepositValues(EMPTY_DIRECT_DEPOSIT_VALUES);
    setApplicantName(EMPTY_APPLICANT_NAME);
    setNameMissingKeys([]);
    setShowDraftRestoredNotice(false);
    setStep(NAME_ENTRY_STEP);
    setSubmitting(false);
    setMessage(t("hardResetDone"));
    setMessageIsError(false);
    setMissingIssues([]);
    setMissingFormStep(null);
    clearMissingMarks();
    setFormSession((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showMissingFields(formStep: number, issues: MissingFieldIssue[]) {
    const rules = getConfigForStep(formStep)?.requiredRules;
    const highlightKeys = getHighlightKeysForIssues(issues, rules);
    const scrollTarget = issues[0]?.scrollTarget ?? highlightKeys[0];

    setMissingFormStep(formStep);
    setMissingIssues(issues);
    setMessage(t("scrolledToMissing"));
    setMessageIsError(true);

    if (step !== formStep) {
      pendingFocusRef.current = { step: formStep, highlightKeys, scrollTarget };
      setStep(formStep);
      return;
    }

    window.setTimeout(() => {
      if (scrollTarget) {
        focusStepMissing(formStep, scrollTarget, highlightKeys);
      }
    }, 50);
  }

  function jumpToMissingField(formStep: number, issue: MissingFieldIssue) {
    const rules = getConfigForStep(formStep)?.requiredRules;
    const highlightKeys = getHighlightKeysForIssues([issue], rules);
    if (step !== formStep) {
      pendingFocusRef.current = {
        step: formStep,
        highlightKeys,
        scrollTarget: issue.scrollTarget
      };
      setStep(formStep);
      return;
    }

    focusStepMissing(formStep, issue.scrollTarget, highlightKeys);
  }

  function validateCurrentStep(): boolean {
    if (step === TUTORIAL_STEP) {
      return true;
    }

    if (step === NAME_ENTRY_STEP) {
      const normalized = normalizeApplicantName(applicantName);
      setApplicantName(normalized);
      if (!isApplicantNameComplete(normalized)) {
        const missing: string[] = [];
        if (!normalized.firstName) missing.push("firstName");
        if (!normalized.lastName) missing.push("lastName");
        setNameMissingKeys(missing);
        setMessage(t("nameEntryRequired"));
        setMessageIsError(true);
        return false;
      }
      setNameMissingKeys([]);
      setFormValues((prev) => applyApplicantPrefill(prev, normalized));
      setDirectDepositValues((prev) => ({
        ...prev,
        employeeName: prev.employeeName.trim().length > 0
          ? prev.employeeName
          : [normalized.firstName, normalized.lastName].filter(Boolean).join(" "),
      }));
      return true;
    }

    if (step === DIRECT_DEPOSIT_STEP) {
      const values = directDepositFormRef.current?.flushValues() ?? directDepositValues;
      const issues = getMissingDirectDepositIssues(values);
      if (issues.length > 0) {
        setDirectDepositValues(values);
        showMissingFields(step, issues);
        return false;
      }
      setDirectDepositValues(values);
      return true;
    }

    if (step >= SUBMIT_STEP) return true;

    if (!isFormStep(step)) return true;

    const config = getConfigForStep(step)!;
    const values = flushStepValues(step);
    const issues = getMissingFieldIssues(config.requiredRules, values);
    if (issues.length > 0) {
      setFormValues((prev) => ({ ...prev, [config.id]: values }));
      showMissingFields(step, issues);
      return false;
    }

    setFormValues((prev) => ({ ...prev, [config.id]: values }));
    return true;
  }

  function jumpToStep(target: number) {
    if (target >= step) return;

    if (isFormStep(step)) {
      const config = ONBOARDING_FORM_CONFIGS[getFormStepIndex(step)];
      const flushed = flushStepValues(step);
      setFormValues((prev) => ({ ...prev, [config.id]: flushed }));
    } else if (step === DIRECT_DEPOSIT_STEP) {
      const flushed = directDepositFormRef.current?.flushValues() ?? directDepositValues;
      setDirectDepositValues(flushed);
    }

    setMessage("");
    setMessageIsError(false);
    setMissingIssues([]);
    setMissingFormStep(null);
    clearMissingMarks();
    setStep(target);
  }

  function nextStep() {
    if (!validateCurrentStep()) return;

    setMessage("");
    setMessageIsError(false);
    setMissingIssues([]);
    setMissingFormStep(null);
    clearMissingMarks();
    setStep((current) => Math.min(current + 1, SUBMIT_STEP));
  }

  function prevStep() {
    if (isFormStep(step)) {
      flushStepValues(step);
    } else if (step === DIRECT_DEPOSIT_STEP) {
      const flushed = directDepositFormRef.current?.flushValues() ?? directDepositValues;
      setDirectDepositValues(flushed);
    } else if (step === SUBMIT_STEP) {
      for (let formStep = FORM_START_STEP; formStep < DIRECT_DEPOSIT_STEP; formStep += 1) {
        flushStepValues(formStep);
      }
      const flushed = directDepositFormRef.current?.flushValues() ?? directDepositValues;
      setDirectDepositValues(flushed);
    }

    setMessage("");
    setMessageIsError(false);
    setMissingIssues([]);
    setMissingFormStep(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submitAndDownload() {
    const normalizedName = normalizeApplicantName(applicantName);
    if (!isApplicantNameComplete(normalizedName)) {
      setApplicantName(normalizedName);
      setNameMissingKeys([
        ...(!normalizedName.firstName ? ["firstName"] : []),
        ...(!normalizedName.lastName ? ["lastName"] : []),
      ]);
      setStep(NAME_ENTRY_STEP);
      setMessage(t("nameEntryRequired"));
      setMessageIsError(true);
      return;
    }

    const flushedByStep = formConfigs.map((config, index) => ({
      formStep: FORM_START_STEP + index,
      values: flushStepValues(FORM_START_STEP + index),
      id: config.id,
    }));

    for (const entry of flushedByStep) {
      const config = formConfigs[getFormStepIndex(entry.formStep)];
      const issues = getMissingFieldIssues(config.requiredRules, entry.values);
      if (issues.length > 0) {
        setFormValues((prev) => ({ ...prev, [entry.id]: entry.values }));
        showMissingFields(entry.formStep, issues);
        return;
      }
    }

    const flushedDirectDeposit =
      directDepositFormRef.current?.flushValues() ?? directDepositValues;

    const directDepositIssues = getMissingDirectDepositIssues(flushedDirectDeposit);
    if (directDepositIssues.length > 0) {
      setDirectDepositValues(flushedDirectDeposit);
      showMissingFields(DIRECT_DEPOSIT_STEP, directDepositIssues);
      return;
    }

    const flushedFormValues = Object.fromEntries(
      flushedByStep.map((entry) => [entry.id, entry.values])
    ) as FormValuesState;

    setFormValues(flushedFormValues);
    setDirectDepositValues(flushedDirectDeposit);

    setSubmitting(true);
    setMessage("");
    setMessageIsError(false);
    setMissingIssues([]);
    setMissingFormStep(null);

    try {
      const packetId = `NH-${Date.now().toString().slice(-6)}`;
      const appendPdfBytes =
        usesDirectDeposit(flushedDirectDeposit)
          ? [await buildDirectDepositPdfBytes(flushedDirectDeposit)]
          : undefined;
      const packetResult = await buildOnboardingPacket(
        formConfigs.map((config) => ({
          templatePath: config.templatePath,
          values: flushedFormValues[config.id],
          pageCount: config.pageCount,
          fields: getStampFieldsForForm(config.id),
        })),
        { appendPdfBytes }
      );
      downloadPdfBytes(packetResult.pdfBytes, ONBOARDING_PACKET_FILENAME);
      const [
        employmentResult,
        w4Result,
        i9Result,
        wh151Result,
      ] = packetResult.formResults;

      let emailSent = false;
      try {
        const emailResponse = await fetch("/api/onboarding/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: normalizedName.firstName,
            lastName: normalizedName.lastName,
            packetId,
            locale,
          formValues: flushedFormValues,
          directDepositValues: flushedDirectDeposit,
          stampFields: Object.fromEntries(
            formConfigs.map((config) => [config.id, getStampFieldsForForm(config.id)])
          ),
        }),
        });
        emailSent = emailResponse.ok;
        if (!emailResponse.ok) {
          const payload = (await emailResponse.json().catch(() => null)) as { error?: string } | null;
          console.error("Email delivery failed:", payload?.error ?? emailResponse.statusText);
        }
      } catch (emailError) {
        console.error("Email delivery failed:", emailError);
      }

      safeSetLocalStorageItem(
        PACKET_KEY,
        JSON.stringify(
          {
            packetId,
            submittedAt: new Date().toISOString(),
            applicantName: normalizedName,
            ...Object.fromEntries(
              formConfigs.map((config) => [`${config.id}Values`, flushedFormValues[config.id]])
            ),
            directDepositValues: flushedDirectDeposit,
            emailSent,
          },
          null,
          2
        )
      );

      setMessage(
        emailSent
          ? t("submitSuccess", {
              id: packetId,
              pageCount: packetResult.pageCount,
              employmentSaved: employmentResult.filledCount,
              w4Saved: w4Result.filledCount,
              i9Saved: i9Result.filledCount,
              whSaved: wh151Result.filledCount,
              directDepositNote: usesDirectDeposit(flushedDirectDeposit)
                ? t("submitSuccessDirectDepositIncluded")
                : t("submitSuccessDirectDepositSkipped"),
            })
          : t("submitEmailFailed")
      );
      setMessageIsError(!emailSent);
      setMissingIssues([]);
      setMissingFormStep(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("downloadFailed"));
      setMessageIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const showDirectDepositSubmit =
    step === DIRECT_DEPOSIT_STEP && directDepositValues.wantsDirectDeposit === false;
  const showStickyNext =
    step < SUBMIT_STEP &&
    (step !== DIRECT_DEPOSIT_STEP || directDepositValues.wantsDirectDeposit === true);
  const packetSummaryKeys = usesDirectDeposit(directDepositValues)
    ? PACKET_SUMMARY_KEYS
    : PACKET_SUMMARY_KEYS.filter((key) => key !== "packetItemDirectDeposit");
  const capturedSignature = useMemo(() => findFirstCapturedSignature(formValues), [formValues]);

  const fillAllSignatureFields = useCallback(() => {
    if (!capturedSignature) return;
    setFormValues((prev) => applyCapturedSignatureToAllForms(prev, capturedSignature));
    setMessage("Signature copied to all documents.");
    setMessageIsError(false);
  }, [capturedSignature]);

  const missingConfig = missingFormStep !== null ? getConfigForStep(missingFormStep) : null;
  const missingFormTitle =
    missingFormStep === NAME_ENTRY_STEP
      ? t("nameEntryTitle")
      : missingFormStep === DIRECT_DEPOSIT_STEP
      ? t("formDirectDeposit")
      : missingConfig
        ? t(FORM_TITLE_KEYS[missingConfig.id])
        : "";

  return (
    <div className="siteLayout">
      <header className="siteHeader">
        <div className="siteBrand">
          <div className="siteLogos">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/barak-group-logo.png" alt="Barak Group Inc." className="siteLogo" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jani-king-logo.png" alt="Jani-King" className="sitePartnerLogo" />
          </div>
          <div className="siteBrandText">
            <p className="siteEyebrow">{t("headerEyebrow")}</p>
            <h1 className="siteTitle">{t("headerTitle")}</h1>
            <p className="siteTagline">{t("appTagline")}</p>
          </div>
        </div>
        <nav className="siteHeaderToolbar" aria-label={t("headerToolbarLabel")}>
          <div className="siteLangToggle" role="group" aria-label={t("language")}>
            <button
              type="button"
              className={`langButton${locale === "en" ? " langButtonActive" : ""}`}
              onClick={() => handleLocaleChange("en")}
              aria-pressed={locale === "en"}
            >
              {t("langEnglish")}
            </button>
            <button
              type="button"
              className={`langButton${locale === "es" ? " langButtonActive" : ""}`}
              onClick={() => handleLocaleChange("es")}
              aria-pressed={locale === "es"}
            >
              {t("langSpanish")}
            </button>
          </div>
          <span className="siteToolbarDivider" aria-hidden="true" />
          <button
            type="button"
            className="siteUtilityButton"
            onClick={hardReset}
            title={t("hardReset")}
          >
            {t("hardResetShort")}
          </button>
        </nav>
      </header>

      <main className="siteMain" ref={formContentRef}>
        <OnboardingStepNav
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onJumpToStep={jumpToStep}
        />

        {showDraftRestoredNotice && !message && (
          <div className="notice noticeOk" role="status">
            <p>{t("draftRestored")}</p>
          </div>
        )}

        {message && (
          <div className={messageIsError ? "notice noticeError" : "notice noticeOk"} role="status">
            <p>{message}</p>
            {messageIsError && missingIssues.length > 0 && (
              <>
                <p className="noticeSub">{t("missingIntro", { form: missingFormTitle })}</p>
                <ul className="missingFieldsList">
                  {missingIssues.map((issue) => (
                    <li key={issue.fieldKey}>
                      <button
                        type="button"
                        className="missingFieldLink"
                        onClick={() => jumpToMissingField(missingFormStep ?? 0, issue)}
                      >
                        {t(issue.labelKey)}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <section
          className="formSection formSectionTutorial"
          style={{ display: step === TUTORIAL_STEP ? "block" : "none" }}
          aria-hidden={step !== TUTORIAL_STEP}
        >
            <header className="tutorialHeader">
              <h2 className="formHeading">{t("tutorialTitle")}</h2>
              <p className="tutorialIntro">{t("tutorialIntro")}</p>
            </header>
            <div className="tutorialCard">
              <ol className="tutorialStepList">
                {TUTORIAL_STEP_KEYS.map((key) => (
                  <li key={key} className="tutorialStepItem">
                    <span className="tutorialStepText">{t(key)}</span>
                  </li>
                ))}
              </ol>
              <p className="tutorialTip">
                <span className="tutorialTipLabel" aria-hidden="true">
                  Tip
                </span>
                {t("tutorialTip")}
              </p>
            </div>
          </section>

          <section
            className="formSection"
            style={{ display: step === NAME_ENTRY_STEP ? "block" : "none" }}
            aria-hidden={step !== NAME_ENTRY_STEP}
          >
            <h2 className="formHeading">{t("nameEntryTitle")}</h2>
            <NameEntryStep
              values={applicantName}
              onChange={(values) => {
                setApplicantName(values);
                if (nameMissingKeys.length > 0) setNameMissingKeys([]);
              }}
              active={step === NAME_ENTRY_STEP}
              missingKeys={nameMissingKeys}
            />
          </section>

          <section
            className="formSection formSectionPdf"
            style={{ display: step === FORM_START_STEP ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP}
          >
            <div className="formStepHeader">
              <h2 className="formHeading">{t("formEmployment")}</h2>
            </div>
            <FillablePdfForm
              key={`employment-${locale}-${formSession}`}
              ref={employmentFormRef}
              config={formConfigs[0]}
              values={formValues.employment}
              onChange={updateEmploymentValues}
              active={step === FORM_START_STEP}
            />
          </section>

          <section
            className="formSection formSectionPdf"
            style={{ display: step === FORM_START_STEP + 1 ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP + 1}
          >
            <div className="formStepHeader">
              <h2 className="formHeading">{t("formW4")}</h2>
            </div>
            <FillablePdfForm
              key={`w4-${locale}-${formSession}`}
              ref={w4FormRef}
              config={formConfigs[1]}
              values={formValues.w4}
              onChange={updateW4Values}
              active={step === FORM_START_STEP + 1}
            />
          </section>

          <section
            className="formSection formSectionPdf"
            style={{ display: step === FORM_START_STEP + 2 ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP + 2}
          >
            <div className="formStepHeader">
              <h2 className="formHeading">{t("formI9")}</h2>
            </div>
            <FillablePdfForm
              key={`i9-${formSession}`}
              ref={i9FormRef}
              config={formConfigs[2]}
              values={formValues.i9}
              onChange={updateI9Values}
              active={step === FORM_START_STEP + 2}
            />
          </section>

          <section
            className="formSection formSectionPdf"
            style={{ display: step === FORM_START_STEP + 3 ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP + 3}
          >
            <div className="formStepHeader">
              <h2 className="formHeading">{t("formWh151")}</h2>
            </div>
            <FillablePdfForm
              key={`wh151-${formSession}`}
              ref={wh151FormRef}
              config={formConfigs[3]}
              values={formValues.wh151}
              onChange={updateWh151Values}
              active={step === FORM_START_STEP + 3}
            />
          </section>

          <section
            className="formSection"
            style={{ display: step === DIRECT_DEPOSIT_STEP ? "block" : "none" }}
            aria-hidden={step !== DIRECT_DEPOSIT_STEP}
          >
            <h2 className="formHeading">{t("formDirectDeposit")}</h2>
            <DirectDepositForm
              key={`direct-deposit-${formSession}`}
              ref={directDepositFormRef}
              values={directDepositValues}
              onChange={setDirectDepositValues}
              active={step === DIRECT_DEPOSIT_STEP}
            />
            {showDirectDepositSubmit && (
              <div className="submitAction directDepositSubmitAction">
                <button type="button" className="primaryButton" onClick={submitAndDownload} disabled={submitting}>
                  {submitting ? t("submitting") : t("submitDownload")}
                </button>
              </div>
            )}
          </section>

          {step === SUBMIT_STEP && (
            <section className="formSection submitPanel">
              <h2 className="formHeading">{t("submitTitle")}</h2>
              <p className="plainText">{t("submitHint")}</p>

              <div className="packetSummary">
                <p className="packetSummaryTitle">{t("packetIncludes")}</p>
                <ul className="packetSummaryList">
                  {packetSummaryKeys.map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              </div>

              <div className="submitAction">
                <button type="button" className="primaryButton" onClick={submitAndDownload} disabled={submitting}>
                  {submitting ? t("submitting") : t("submitDownload")}
                </button>
              </div>
            </section>
          )}

        <div className="stickyActionBar">
          <div className="actionRow">
            {step > TUTORIAL_STEP ? (
              <button type="button" className="secondaryButton" onClick={prevStep}>
                {t("back")}
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            {capturedSignature && isFormStep(step) && (
              <button type="button" className="secondaryButton" onClick={fillAllSignatureFields}>
                Use first signature everywhere
              </button>
            )}
            {showDirectDepositSubmit ? (
              <button type="button" className="primaryButton" onClick={submitAndDownload} disabled={submitting}>
                {submitting ? t("submitting") : t("submitDownload")}
              </button>
            ) : showStickyNext ? (
              <button type="button" className="primaryButton" onClick={nextStep}>
                {t("next")}
              </button>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="siteFooter">
        <p>{t("footerNote")}</p>
        <p>{t("footerHelp")}</p>
      </footer>
    </div>
  );
}
