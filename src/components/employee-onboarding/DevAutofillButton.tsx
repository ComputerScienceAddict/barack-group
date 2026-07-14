"use client";

import { isDevAutofillEnabled } from "@/lib/employee-onboarding/devAutofill";

type DevAutofillButtonProps = {
  onAutofill: () => void;
  label?: string;
};

/** Shown in development to quickly fill the onboarding form with sample data. */
export default function DevAutofillButton({
  onAutofill,
  label = "Autofill",
}: DevAutofillButtonProps) {
  if (!isDevAutofillEnabled()) return null;

  return (
    <div className="devAutofillToolbar">
      <button type="button" className="devAutofillButton" onClick={onAutofill}>
        {label}
      </button>
    </div>
  );
}
