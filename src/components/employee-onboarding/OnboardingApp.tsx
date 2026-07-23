"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InfoStep from "@/components/employee-onboarding/InfoStep";
import DevAutofillButton from "@/components/employee-onboarding/DevAutofillButton";
import { LanguageProvider, useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import type { DirectDepositFormHandle } from "@/components/employee-onboarding/DirectDepositForm";
import {
  EMPTY_ANSWERS,
  mapAnswersToPdfValues,
  validateAnswers,
  type OnboardingAnswers,
} from "@/lib/employee-onboarding/onboardingAnswers";
import { getQuietAutofillPayload } from "@/lib/employee-onboarding/devAutofill";
import {
  EMPTY_DIRECT_DEPOSIT_VALUES,
  buildDirectDepositPdfBytes,
  getMissingDirectDepositIssues,
  normalizeDirectDepositValues,
  usesDirectDeposit,
  type DirectDepositValues,
} from "@/lib/employee-onboarding/directDeposit";
import {
  buildOnboardingPacket,
  downloadPdfBytes,
} from "@/lib/employee-onboarding/fillPdf";
import {
  ONBOARDING_PACKET_FILENAME,
  getOnboardingFormConfigs,
} from "@/lib/employee-onboarding/pdfForms";

const ANSWERS_DRAFT_KEY = "newHireOnboardingAnswersV2";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
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

  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const [signature, setSignature] = useState("");
  const [directDepositValues, setDirectDepositValues] = useState<DirectDepositValues>(
    EMPTY_DIRECT_DEPOSIT_VALUES
  );
  const [hydrated, setHydrated] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [signatureMissing, setSignatureMissing] = useState(false);
  const [signatureSession, setSignatureSession] = useState(0);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const directDepositRef = useRef<DirectDepositFormHandle>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = safeGet(ANSWERS_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as {
          answers?: OnboardingAnswers;
          directDepositValues?: DirectDepositValues;
        };
        if (draft.answers) setAnswers({ ...EMPTY_ANSWERS, ...draft.answers });
        if (draft.directDepositValues) {
          setDirectDepositValues(normalizeDirectDepositValues(draft.directDepositValues));
        }
      }
    } catch {
      // ignore corrupt drafts
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeSet(ANSWERS_DRAFT_KEY, JSON.stringify({ answers, directDepositValues }));
  }, [answers, directDepositValues, hydrated]);

  // Keep DD employee name in sync when they type their name
  useEffect(() => {
    const fullName = `${answers.firstName} ${answers.lastName}`.trim();
    if (!fullName) return;
    setDirectDepositValues((prev) =>
      prev.employeeName === fullName ? prev : { ...prev, employeeName: fullName }
    );
  }, [answers.firstName, answers.lastName]);

  const handleAnswersChange = useCallback(
    (updates: Partial<OnboardingAnswers>) => {
      setAnswers((prev) => ({ ...prev, ...updates }));
      if (missingFields.length > 0) {
        setMissingFields((prev) => prev.filter((key) => !(key in updates)));
      }
    },
    [missingFields.length]
  );

  function scrollToFirstIssue(fields: string[], needSignature: boolean) {
    const first = fields[0];
    const root = mainRef.current;
    if (!root) return;
    if (needSignature && fields.length === 0) {
      document.getElementById("signature-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!first) return;
    const node = root.querySelector<HTMLElement>(`[data-field="${first}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit() {
    const { isValid, missingFields: missing } = validateAnswers(answers);
    const needSignature = !signature;
    setMissingFields(missing);
    setSignatureMissing(needSignature);

    const ddValues = directDepositRef.current?.flushValues() ?? directDepositValues;
    setDirectDepositValues(ddValues);
    const ddIssues = getMissingDirectDepositIssues(ddValues);

    if (!isValid || needSignature || ddIssues.length > 0) {
      if (ddIssues.length > 0) {
        directDepositRef.current?.focusMissingFields(ddIssues.map((i) => i.fieldKey));
      }
      setMessage(
        !isValid
          ? t("quietMissingFields")
          : needSignature
            ? t("quietMissingSignature")
            : t("quietMissingDirectDeposit")
      );
      setMessageIsError(true);
      scrollToFirstIssue(missing, needSignature);
      return;
    }

    const formValues = mapAnswersToPdfValues(answers, signature);

    setSubmitting(true);
    setMessage("");
    setMessageIsError(false);

    try {
      const packetId = `NH-${Date.now().toString().slice(-6)}`;
      const appendPdfBytes = usesDirectDeposit(ddValues)
        ? [await buildDirectDepositPdfBytes(ddValues)]
        : undefined;

      const packetResult = await buildOnboardingPacket(
        formConfigs.map((config) => ({
          templatePath: config.templatePath,
          values: formValues[config.id as keyof typeof formValues],
          pageCount: config.pageCount,
        })),
        { appendPdfBytes }
      );

      downloadPdfBytes(packetResult.pdfBytes, ONBOARDING_PACKET_FILENAME);

      let emailSent = false;
      try {
        const emailResponse = await fetch("/api/onboarding/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: answers.firstName.trim(),
            lastName: answers.lastName.trim(),
            state: answers.applyingFromState.trim(),
            packetId,
            locale,
            formValues,
            directDepositValues: ddValues,
            stampFields: {},
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

      safeRemove(ANSWERS_DRAFT_KEY);

      setMessage(
        emailSent
          ? t("submitSuccess", {
              id: packetId,
              pageCount: packetResult.pageCount,
              employmentSaved: packetResult.formResults[0]?.filledCount ?? 0,
              w4Saved: packetResult.formResults[1]?.filledCount ?? 0,
              i9Saved: packetResult.formResults[2]?.filledCount ?? 0,
              whSaved: packetResult.formResults[3]?.filledCount ?? 0,
              directDepositNote: usesDirectDeposit(ddValues)
                ? t("submitSuccessDirectDepositIncluded")
                : t("submitSuccessDirectDepositSkipped"),
            })
          : t("submitEmailFailed")
      );
      setMessageIsError(!emailSent);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("downloadFailed"));
      setMessageIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function hardReset() {
    safeRemove(ANSWERS_DRAFT_KEY);
    setAnswers(EMPTY_ANSWERS);
    setSignature("");
    setSignatureSession((n) => n + 1);
    setDirectDepositValues(EMPTY_DIRECT_DEPOSIT_VALUES);
    setMissingFields([]);
    setSignatureMissing(false);
    setMessage("");
    setMessageIsError(false);
  }

  function handleAutofill() {
    const payload = getQuietAutofillPayload(locale);
    setAnswers(payload.answers);
    setSignature(payload.signature);
    setSignatureSession((n) => n + 1);
    setDirectDepositValues(payload.directDeposit);
    setMissingFields([]);
    setSignatureMissing(false);
    setMessage("");
    setMessageIsError(false);
  }

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
            <p className="siteTagline">{t("quietTagline")}</p>
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
          <DevAutofillButton onAutofill={handleAutofill} label="Autofill" />
          <button type="button" className="siteUtilityButton" onClick={hardReset} title={t("hardReset")}>
            {t("hardResetShort")}
          </button>
        </nav>
      </header>

      <main className="siteMain" ref={mainRef}>
        {message && (
          <div className={messageIsError ? "notice noticeError" : "notice noticeOk"} role="status">
            <p>{message}</p>
          </div>
        )}

        <InfoStep
          answers={answers}
          onChange={handleAnswersChange}
          missingFields={missingFields}
          signature={signature}
          signatureSession={signatureSession}
          onSignatureChange={(sig) => {
            setSignature(sig);
            if (sig) setSignatureMissing(false);
          }}
          signatureMissing={signatureMissing}
          directDepositValues={directDepositValues}
          onDirectDepositChange={setDirectDepositValues}
          directDepositRef={directDepositRef}
        />

        <div className="stickyActionBar">
          <button
            type="button"
            className="primaryButton"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t("quietSubmitting") : t("quietSubmit")}
          </button>
        </div>
      </main>
    </div>
  );
}
