"use client";

import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import type { ApplicantName } from "@/lib/employee-onboarding/applicantName";

type NameEntryStepProps = {
  values: ApplicantName;
  onChange: (values: ApplicantName) => void;
  active?: boolean;
  missingKeys?: string[];
};

export default function NameEntryStep({
  values,
  onChange,
  active = true,
  missingKeys = [],
}: NameEntryStepProps) {
  const { t } = useLanguage();

  if (!active) return null;

  const missingClass = (key: string) => (missingKeys.includes(key) ? " nameEntryFieldMissing" : "");
  const updateField = (key: "firstName" | "lastName", value: string) => {
    if (values[key] === value) return;
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="nameEntryForm">
      <div className="nameEntryIntro">
        <p className="formSubheading">{t("nameEntryHint")}</p>
      </div>
      <div className="fieldGrid nameEntryGrid">
        <label className={`fieldBlock${missingClass("firstName")}`} data-field="firstName">
          <span className="fieldLabel">{t("fieldFirstName")}</span>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            onInput={(event) => updateField("firstName", event.currentTarget.value)}
            onBlur={(event) => updateField("firstName", event.currentTarget.value)}
            placeholder={t("nameEntryFirstNamePlaceholder")}
          />
        </label>
        <label className={`fieldBlock${missingClass("lastName")}`} data-field="lastName">
          <span className="fieldLabel">{t("fieldLastName")}</span>
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            onInput={(event) => updateField("lastName", event.currentTarget.value)}
            onBlur={(event) => updateField("lastName", event.currentTarget.value)}
            placeholder={t("nameEntryLastNamePlaceholder")}
          />
        </label>
      </div>
    </div>
  );
}
