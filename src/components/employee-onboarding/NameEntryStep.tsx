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
            onChange={(event) => onChange({ ...values, firstName: event.target.value })}
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
            onChange={(event) => onChange({ ...values, lastName: event.target.value })}
            placeholder={t("nameEntryLastNamePlaceholder")}
          />
        </label>
      </div>
    </div>
  );
}
