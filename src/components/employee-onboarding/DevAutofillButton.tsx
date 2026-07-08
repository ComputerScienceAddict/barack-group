"use client";

import { isDevAutofillEnabled } from "@/lib/employee-onboarding/devAutofill";

type DevAutofillButtonProps = {
  onAutofill: () => void;
  label?: string;
};

/** Local dev only — stripped from production builds. */
export default function DevAutofillButton({
  onAutofill,
  label = "Dev: Autofill this form",
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
