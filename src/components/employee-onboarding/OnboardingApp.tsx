"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { pdfFieldValuesEqual, mergePdfFieldValues } from "@/lib/employee-onboarding/pdfFieldValues";
import {
  DIRECT_DEPOSIT_STEP,
  FORM_START_STEP,
  NAME_ENTRY_STEP,
  ONBOARDING_FORM_CONFIGS,
  ONBOARDING_PACKET_FILENAME,
  SUBMIT_STEP,
  TOTAL_STEPS,
  getFormStepIndex,
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

const PACKET_SUMMARY_KEYS: MessageKey[] = [
  "packetItemEmployment",
  "packetItemW4",
  "packetItemI9",
  "packetItemWh151",
  "packetItemDirectDeposit",
];

const FORM_TITLE_KEYS: Record<OnboardingFormId, MessageKey> = {
  employment: "formEmployment",
  w4: "formW4",
  i9: "formI9",
  wh151: "formWh151"
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function applyApplicantPrefill(
  current: FormValuesState,
  name: ApplicantName
): FormValuesState {
  return {
    ...current,
    employment: {
      ...current.employment,
      nombre: name.firstName,
      apellido: name.lastName,
    },
    i9: {
      ...current.i9,
      "First Name Given Name from Section 1": name.firstName,
      "First Name Given Name": name.firstName,
      "Last Name Family Name from Section 1": name.lastName,
    },
  };
}

function getConfigForStep(formStep: number): PdfFormConfig | null {
  if (!isFormStep(formStep)) return null;
  return ONBOARDING_FORM_CONFIGS[getFormStepIndex(formStep)] ?? null;
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
  const [initialDraft] = useState(readDraftSnapshot);
  const [step, setStep] = useState(initialDraft.step);
  const [formValues, setFormValues] = useState<FormValuesState>(initialDraft.formValues);
  const [directDepositValues, setDirectDepositValues] = useState<DirectDepositValues>(
    initialDraft.directDepositValues
  );
  const [applicantName, setApplicantName] = useState<ApplicantName>(initialDraft.applicantName);
  const [nameMissingKeys, setNameMissingKeys] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [showDraftRestoredNotice, setShowDraftRestoredNotice] = useState(initialDraft.draftRestored);
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

  const updateFormValues = useCallback((formId: OnboardingFormId, values: Record<string, PdfFieldValue>) => {
    setFormValues((prev) => {
      if (pdfFieldValuesEqual(prev[formId], values)) return prev;
      return { ...prev, [formId]: values };
    });
  }, []);

  const updateEmploymentValues = useCallback(
    (values: Record<string, PdfFieldValue>) => updateFormValues("employment", values),
    [updateFormValues]
  );

  const updateW4Values = useCallback(
    (values: Record<string, PdfFieldValue>) => updateFormValues("w4", values),
    [updateFormValues]
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

  function flushStepValues(formStep: number): Record<string, PdfFieldValue> {
    const config = getConfigForStep(formStep);
    if (!config) return {};
    const ref = getFormRef(config.id);
    const flushed = ref?.current?.flushValues() ?? formValues[config.id];
    return mergePdfFieldValues(formValues[config.id], flushed);
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
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ formValues, directDepositValues, applicantName, step, savedAt: new Date().toISOString() })
    );
  }, [applicantName, directDepositValues, formValues, step]);

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
    const highlightKeys = getHighlightKeysForIssues(issues);
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
    const highlightKeys = getHighlightKeysForIssues([issue]);
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

    const flushedEmployment = flushStepValues(FORM_START_STEP);
    const flushedW4 = flushStepValues(FORM_START_STEP + 1);
    const flushedI9 = flushStepValues(FORM_START_STEP + 2);
    const flushedWh151 = flushStepValues(FORM_START_STEP + 3);
    const flushedDirectDeposit =
      directDepositFormRef.current?.flushValues() ?? directDepositValues;

    const flushedByStep = [
      { formStep: FORM_START_STEP, values: flushedEmployment, id: "employment" as const },
      { formStep: FORM_START_STEP + 1, values: flushedW4, id: "w4" as const },
      { formStep: FORM_START_STEP + 2, values: flushedI9, id: "i9" as const },
      { formStep: FORM_START_STEP + 3, values: flushedWh151, id: "wh151" as const },
    ];

    for (const entry of flushedByStep) {
      const config = ONBOARDING_FORM_CONFIGS[getFormStepIndex(entry.formStep)];
      const issues = getMissingFieldIssues(config.requiredRules, entry.values);
      if (issues.length > 0) {
        setFormValues((prev) => ({ ...prev, [entry.id]: entry.values }));
        showMissingFields(entry.formStep, issues);
        return;
      }
    }

    const directDepositIssues = getMissingDirectDepositIssues(flushedDirectDeposit);
    if (directDepositIssues.length > 0) {
      setDirectDepositValues(flushedDirectDeposit);
      showMissingFields(DIRECT_DEPOSIT_STEP, directDepositIssues);
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      employment: flushedEmployment,
      w4: flushedW4,
      i9: flushedI9,
      wh151: flushedWh151
    }));
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
        [
          { templatePath: ONBOARDING_FORM_CONFIGS[0].templatePath, values: flushedEmployment },
          { templatePath: ONBOARDING_FORM_CONFIGS[1].templatePath, values: flushedW4 },
          { templatePath: ONBOARDING_FORM_CONFIGS[2].templatePath, values: flushedI9 },
          { templatePath: ONBOARDING_FORM_CONFIGS[3].templatePath, values: flushedWh151 },
        ],
        { appendPdfBytes }
      );
      downloadPdfBytes(packetResult.pdfBytes, ONBOARDING_PACKET_FILENAME);
      const [employmentResult, w4Result, i9Result, wh151Result] = packetResult.formResults;

      let emailSent = false;
      try {
        const emailResponse = await fetch("/api/onboarding/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: normalizedName.firstName,
            lastName: normalizedName.lastName,
            packetId,
            pdfBase64: bytesToBase64(packetResult.pdfBytes),
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

      window.localStorage.setItem(
        PACKET_KEY,
        JSON.stringify(
          {
            packetId,
            submittedAt: new Date().toISOString(),
            applicantName: normalizedName,
            employmentValues: flushedEmployment,
            w4Values: flushedW4,
            i9Values: flushedI9,
            wh151Values: flushedWh151,
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
          <div className="siteLogoStack">
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
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
            >
              {t("langEnglish")}
            </button>
            <button
              type="button"
              className={`langButton${locale === "es" ? " langButtonActive" : ""}`}
              onClick={() => setLocale("es")}
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

        <div className="formPanel">
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
            className="formSection"
            style={{ display: step === FORM_START_STEP ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP}
          >
            <h2 className="formHeading">{t("formEmployment")}</h2>
            <p className="formSubheading">{t("employmentFormHint")}</p>
            <FillablePdfForm
              key={`employment-${formSession}`}
              ref={employmentFormRef}
              config={ONBOARDING_FORM_CONFIGS[0]}
              values={formValues.employment}
              onChange={updateEmploymentValues}
              active={step === FORM_START_STEP}
            />
          </section>

          <section
            className="formSection"
            style={{ display: step === FORM_START_STEP + 1 ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP + 1}
          >
            <h2 className="formHeading">{t("formW4")}</h2>
            <p className="formSubheading">{t("embeddedPdfHint")}</p>
            <FillablePdfForm
              key={`w4-${formSession}`}
              ref={w4FormRef}
              config={ONBOARDING_FORM_CONFIGS[1]}
              values={formValues.w4}
              onChange={updateW4Values}
              active={step === FORM_START_STEP + 1}
            />
          </section>

          <section
            className="formSection"
            style={{ display: step === FORM_START_STEP + 2 ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP + 2}
          >
            <h2 className="formHeading">{t("formI9")}</h2>
            <p className="formSubheading">{t("embeddedPdfHint")}</p>
            <FillablePdfForm
              key={`i9-${formSession}`}
              ref={i9FormRef}
              config={ONBOARDING_FORM_CONFIGS[2]}
              values={formValues.i9}
              onChange={updateI9Values}
              active={step === FORM_START_STEP + 2}
            />
          </section>

          <section
            className="formSection"
            style={{ display: step === FORM_START_STEP + 3 ? "block" : "none" }}
            aria-hidden={step !== FORM_START_STEP + 3}
          >
            <h2 className="formHeading">{t("formWh151")}</h2>
            <p className="formSubheading">{t("embeddedPdfHint")}</p>
            <FillablePdfForm
              key={`wh151-${formSession}`}
              ref={wh151FormRef}
              config={ONBOARDING_FORM_CONFIGS[3]}
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
        </div>

        <div className="stickyActionBar">
          <div className="actionRow">
            {step > NAME_ENTRY_STEP ? (
              <button type="button" className="secondaryButton" onClick={prevStep}>
                {t("back")}
              </button>
            ) : (
              <span aria-hidden="true" />
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
