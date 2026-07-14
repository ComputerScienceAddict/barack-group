"use client";

import type { MessageKey } from "@/lib/employee-onboarding/i18n";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";

const STEP_NAV_KEYS: MessageKey[] = [
  "stepNameTutorial",
  "stepNameApplicant",
  "stepNameEmployment",
  "stepNameW4",
  "stepNameI9",
  "stepNameWh151",
  "stepNameDirectDeposit",
  "stepNameSubmit",
];

type OnboardingStepNavProps = {
  currentStep: number;
  totalSteps: number;
  onJumpToStep: (step: number) => void;
  /** When provided, overrides the default 8-step label list with custom step names. */
  stepNames?: string[];
};

export default function OnboardingStepNav({
  currentStep,
  totalSteps,
  onJumpToStep,
  stepNames,
}: OnboardingStepNavProps) {
  const { t } = useLanguage();
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
  const labels: string[] = stepNames ?? STEP_NAV_KEYS.map((key) => t(key));

  return (
    <nav className="stepNav" aria-label={t("stepNavLabel")}>
      <div className="stepNavMeta">
        <span className="stepNavCount">
          {t("stepOf", { current: currentStep + 1, total: totalSteps })}
        </span>
        <span className="stepNavPercent">{progressPercent}%</span>
      </div>

      <div className="stepProgressTrack" aria-hidden="true">
        <div className="stepProgressFill" style={{ width: `${progressPercent}%` }} />
      </div>

      <ol className="stepPillList">
        {labels.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const canJump = index < currentStep;

          return (
            <li key={label} className="stepPillItem">
              <button
                type="button"
                className={`stepPill${isCurrent ? " stepPillCurrent" : ""}${isComplete ? " stepPillComplete" : ""}`}
                onClick={() => canJump && onJumpToStep(index)}
                disabled={!canJump && !isCurrent}
                aria-current={isCurrent ? "step" : undefined}
                title={label}
              >
                <span className="stepPillIndex">{isComplete ? "✓" : index + 1}</span>
                <span className="stepPillLabel">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
