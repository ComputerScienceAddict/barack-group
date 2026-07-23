"use client";

import SignaturePad from "@/components/employee-onboarding/SignaturePad";
import DirectDepositForm, {
  type DirectDepositFormHandle,
} from "@/components/employee-onboarding/DirectDepositForm";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import { encodeDrawnSignature } from "@/lib/employee-onboarding/signatureFields";
import type { DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import type {
  OnboardingAnswers,
  PositionType,
  ShiftType,
  FilingStatus,
  CitizenshipStatus,
  ApplyingFromState,
} from "@/lib/employee-onboarding/onboardingAnswers";
import {
  formatSsnInput,
  formatDependentCountInput,
  computeW4Step3Amounts,
  APPLYING_FROM_STATES,
} from "@/lib/employee-onboarding/onboardingAnswers";
import type { MessageKey } from "@/lib/employee-onboarding/i18n";

const US_STATES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

type InfoStepProps = {
  answers: OnboardingAnswers;
  onChange: (updates: Partial<OnboardingAnswers>) => void;
  missingFields: string[];
  signature: string;
  signatureSession?: number;
  onSignatureChange: (sig: string) => void;
  signatureMissing: boolean;
  directDepositValues: DirectDepositValues;
  onDirectDepositChange: (values: DirectDepositValues) => void;
  directDepositRef: React.Ref<DirectDepositFormHandle>;
};

function miss(key: string, missingFields: string[]) {
  return missingFields.includes(key) ? " fieldMissing" : "";
}

function YesNo({
  id,
  label,
  value,
  onChange,
  missing,
  yesLabel,
  noLabel,
}: {
  id: string;
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  missing: boolean;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <fieldset className={`quietChoice${missing ? " fieldMissing" : ""}`}>
      <legend className="quietChoiceLabel">{label}</legend>
      <div className="quietChoiceRow">
        <label className={value === true ? "isOn" : ""}>
          <input type="radio" name={id} checked={value === true} onChange={() => onChange(true)} />
          {yesLabel}
        </label>
        <label className={value === false ? "isOn" : ""}>
          <input type="radio" name={id} checked={value === false} onChange={() => onChange(false)} />
          {noLabel}
        </label>
      </div>
    </fieldset>
  );
}

export default function InfoStep({
  answers,
  onChange,
  missingFields,
  signature,
  signatureSession = 0,
  onSignatureChange,
  signatureMissing,
  directDepositValues,
  onDirectDepositChange,
  directDepositRef,
}: InfoStepProps) {
  const { t } = useLanguage();

  function set<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) {
    onChange({ [key]: value } as Partial<OnboardingAnswers>);
  }

  function togglePosition(pos: PositionType) {
    const current = answers.positions;
    set("positions", current.includes(pos) ? current.filter((p) => p !== pos) : [...current, pos]);
  }

  function toggleShift(shift: ShiftType) {
    const current = answers.shifts;
    set("shifts", current.includes(shift) ? current.filter((s) => s !== shift) : [...current, shift]);
  }

  const positions: [PositionType, MessageKey][] = [
    ["full_time", "positionFullTime"],
    ["part_time", "positionPartTime"],
    ["temporary", "positionTemporary"],
    ["on_call", "positionOnCall"],
  ];

  const shifts: [ShiftType, MessageKey][] = [
    ["day", "shiftDay"],
    ["afternoon", "shiftAfternoon"],
    ["night", "shiftNight"],
    ["weekends", "shiftWeekends"],
    ["any", "shiftAny"],
  ];

  const filingOptions: [FilingStatus, MessageKey][] = [
    [0, "filingSingle"],
    [1, "filingMarriedJoint"],
    [2, "filingHeadOfHousehold"],
  ];

  const citizenshipOptions: [CitizenshipStatus, MessageKey][] = [
    [1, "citizenshipCitizen"],
    [2, "citizenshipNoncitizenNational"],
    [3, "citizenshipPermanentResident"],
    [4, "citizenshipAlienAuthorized"],
  ];

  const step3Amounts = computeW4Step3Amounts(answers);

  return (
    <div className="quietForm">
      <p className="quietIntro">{t("quietIntro")}</p>

      <section className="quietBlock">
        <h2 className="quietHeading">{t("sectionApplyingFrom")}</h2>
        <p className="quietHint">{t("quietApplyingFromHint")}</p>
        <fieldset
          className={`quietChoice${missingFields.includes("applyingFromState") ? " fieldMissing" : ""}`}
          data-field="applyingFromState"
        >
          <legend className="quietChoiceLabel">{t("quietApplyingFrom")}</legend>
          <div className="quietApplyFromGrid">
            {APPLYING_FROM_STATES.map((entry) => (
              <label
                key={entry.code}
                className={answers.applyingFromState === entry.code ? "isOn" : ""}
              >
                <input
                  type="radio"
                  name="applyingFromState"
                  checked={answers.applyingFromState === entry.code}
                  onChange={() => set("applyingFromState", entry.code as ApplyingFromState)}
                />
                {entry.name}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="quietBlock">
        <h2 className="quietHeading">{t("sectionAboutYou")}</h2>

        <div className="fieldGrid twoColumns">
          <label className={`fieldBlock${miss("firstName", missingFields)}`} data-field="firstName">
            <span className="fieldLabel">{t("fieldFirstName")}</span>
            <input
              type="text"
              autoComplete="given-name"
              value={answers.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </label>
          <label className={`fieldBlock${miss("lastName", missingFields)}`} data-field="lastName">
            <span className="fieldLabel">{t("fieldLastName")}</span>
            <input
              type="text"
              autoComplete="family-name"
              value={answers.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </label>
        </div>

        <div className="fieldGrid twoColumns">
          <label className={`fieldBlock${miss("dateOfBirth", missingFields)}`} data-field="dateOfBirth">
            <span className="fieldLabel">{t("fieldDob")}</span>
            <input
              type="date"
              value={answers.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </label>
          <label className={`fieldBlock${miss("ssn", missingFields)}`} data-field="ssn">
            <span className="fieldLabel">{t("fieldSsn")}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={answers.ssn}
              onChange={(e) => set("ssn", formatSsnInput(e.target.value))}
              placeholder="123-45-6789"
              aria-invalid={missingFields.includes("ssn")}
            />
          </label>
        </div>

        <div className="fieldGrid twoColumns">
          <label className={`fieldBlock${miss("phone", missingFields)}`} data-field="phone">
            <span className="fieldLabel">{t("fieldPhone")}</span>
            <input
              type="tel"
              autoComplete="tel"
              value={answers.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </label>
          <label className={`fieldBlock${miss("email", missingFields)}`} data-field="email">
            <span className="fieldLabel">{t("fieldEmail")}</span>
            <input
              type="email"
              autoComplete="email"
              value={answers.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>
        </div>

        <label className={`fieldBlock${miss("address", missingFields)}`} data-field="address">
          <span className="fieldLabel">{t("fieldAddress")}</span>
          <input
            type="text"
            autoComplete="street-address"
            value={answers.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </label>

        <div className="fieldGrid infoCityRow">
          <label className={`fieldBlock${miss("city", missingFields)}`} data-field="city">
            <span className="fieldLabel">{t("fieldCity")}</span>
            <input
              type="text"
              autoComplete="address-level2"
              value={answers.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </label>
          <label className={`fieldBlock${miss("state", missingFields)}`} data-field="state">
            <span className="fieldLabel">{t("fieldState")}</span>
            <select
              autoComplete="address-level1"
              value={answers.state}
              onChange={(e) => set("state", e.target.value)}
            >
              <option value="">{t("fieldState")}</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code}
                </option>
              ))}
            </select>
          </label>
          <label className={`fieldBlock${miss("zip", missingFields)}`} data-field="zip">
            <span className="fieldLabel">{t("fieldZip")}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              value={answers.zip}
              onChange={(e) => set("zip", e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="quietBlock">
        <h2 className="quietHeading">{t("sectionJobPreferences")}</h2>

        <YesNo
          id="age18"
          label={t("quietAge18")}
          value={answers.age18}
          onChange={(v) => set("age18", v)}
          missing={missingFields.includes("age18")}
          yesLabel={t("quietYes")}
          noLabel={t("quietNo")}
        />

        <fieldset className={`quietChoice${missingFields.includes("positions") ? " fieldMissing" : ""}`}>
          <legend className="quietChoiceLabel">{t("quietPositionType")}</legend>
          <div className="quietChipRow">
            {positions.map(([val, labelKey]) => (
              <label key={val} className={answers.positions.includes(val) ? "isOn" : ""}>
                <input
                  type="checkbox"
                  checked={answers.positions.includes(val)}
                  onChange={() => togglePosition(val)}
                />
                {t(labelKey)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={`quietChoice${missingFields.includes("shifts") ? " fieldMissing" : ""}`}>
          <legend className="quietChoiceLabel">{t("quietShiftPreference")}</legend>
          <div className="quietChipRow">
            {shifts.map(([val, labelKey]) => (
              <label key={val} className={answers.shifts.includes(val) ? "isOn" : ""}>
                <input
                  type="checkbox"
                  checked={answers.shifts.includes(val)}
                  onChange={() => toggleShift(val)}
                />
                {t(labelKey)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="yesNoGrid">
          <YesNo
            id="travel"
            label={t("quietTravel")}
            value={answers.travel}
            onChange={(v) => set("travel", v)}
            missing={missingFields.includes("travel")}
            yesLabel={t("quietYes")}
            noLabel={t("quietNo")}
          />
          <YesNo
            id="overtime"
            label={t("quietOvertime")}
            value={answers.overtime}
            onChange={(v) => set("overtime", v)}
            missing={missingFields.includes("overtime")}
            yesLabel={t("quietYes")}
            noLabel={t("quietNo")}
          />
          <YesNo
            id="authorizedToWork"
            label={t("quietWorkAuth")}
            value={answers.authorizedToWork}
            onChange={(v) => set("authorizedToWork", v)}
            missing={missingFields.includes("authorizedToWork")}
            yesLabel={t("quietYes")}
            noLabel={t("quietNo")}
          />
        </div>
      </section>

      <section className="quietBlock">
        <h2 className="quietHeading">{t("sectionEmergencyContacts")}</h2>

        <p className="quietSubheading">{t("quietContact1")}</p>
        <div className="fieldGrid twoColumns">
          <label className={`fieldBlock${miss("emergency1Name", missingFields)}`} data-field="emergency1Name">
            <span className="fieldLabel">{t("quietFullName")}</span>
            <input
              type="text"
              value={answers.emergency1Name}
              onChange={(e) => set("emergency1Name", e.target.value)}
            />
          </label>
          <label
            className={`fieldBlock${miss("emergency1Relationship", missingFields)}`}
            data-field="emergency1Relationship"
          >
            <span className="fieldLabel">{t("quietRelationship")}</span>
            <input
              type="text"
              value={answers.emergency1Relationship}
              onChange={(e) => set("emergency1Relationship", e.target.value)}
            />
          </label>
          <label className={`fieldBlock${miss("emergency1Phone", missingFields)}`} data-field="emergency1Phone">
            <span className="fieldLabel">{t("fieldPhone")}</span>
            <input
              type="tel"
              value={answers.emergency1Phone}
              onChange={(e) => set("emergency1Phone", e.target.value)}
            />
          </label>
          <label
            className={`fieldBlock${miss("emergency1AltPhone", missingFields)}`}
            data-field="emergency1AltPhone"
          >
            <span className="fieldLabel">{t("quietAltPhone")}</span>
            <input
              type="tel"
              value={answers.emergency1AltPhone}
              onChange={(e) => set("emergency1AltPhone", e.target.value)}
            />
          </label>
        </div>

        <p className="quietSubheading">{t("quietContact2")}</p>
        <div className="fieldGrid twoColumns">
          <label className={`fieldBlock${miss("emergency2Name", missingFields)}`} data-field="emergency2Name">
            <span className="fieldLabel">{t("quietFullName")}</span>
            <input
              type="text"
              value={answers.emergency2Name}
              onChange={(e) => set("emergency2Name", e.target.value)}
            />
          </label>
          <label
            className={`fieldBlock${miss("emergency2Relationship", missingFields)}`}
            data-field="emergency2Relationship"
          >
            <span className="fieldLabel">{t("quietRelationship")}</span>
            <input
              type="text"
              value={answers.emergency2Relationship}
              onChange={(e) => set("emergency2Relationship", e.target.value)}
            />
          </label>
          <label className={`fieldBlock${miss("emergency2Phone", missingFields)}`} data-field="emergency2Phone">
            <span className="fieldLabel">{t("fieldPhone")}</span>
            <input
              type="tel"
              value={answers.emergency2Phone}
              onChange={(e) => set("emergency2Phone", e.target.value)}
            />
          </label>
          <label
            className={`fieldBlock${miss("emergency2AltPhone", missingFields)}`}
            data-field="emergency2AltPhone"
          >
            <span className="fieldLabel">{t("quietAltPhone")}</span>
            <input
              type="tel"
              value={answers.emergency2AltPhone}
              onChange={(e) => set("emergency2AltPhone", e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="quietBlock">
        <h2 className="quietHeading">{t("sectionTaxCitizenship")}</h2>

        <fieldset className={`quietChoice${missingFields.includes("w4FilingStatus") ? " fieldMissing" : ""}`}>
          <legend className="quietChoiceLabel">{t("quietW4FilingStatus")}</legend>
          <div className="quietList">
            {filingOptions.map(([val, labelKey]) => (
              <label key={val} className={answers.w4FilingStatus === val ? "isOn" : ""}>
                <input
                  type="radio"
                  name="w4FilingStatus"
                  checked={answers.w4FilingStatus === val}
                  onChange={() => set("w4FilingStatus", val)}
                />
                {t(labelKey)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="quietDependents">
          <p className="quietSubheading">{t("quietW4Dependents")}</p>
          <p className="quietHint">{t("quietW4DependentsHint")}</p>
          <div className="fieldGrid twoColumns">
            <label
              className={`fieldBlock${miss("w4QualifyingChildren", missingFields)}`}
              data-field="w4QualifyingChildren"
            >
              <span className="fieldLabel">{t("quietW4QualifyingChildren")}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={answers.w4QualifyingChildren}
                onChange={(e) => set("w4QualifyingChildren", formatDependentCountInput(e.target.value))}
                placeholder="0"
                aria-invalid={missingFields.includes("w4QualifyingChildren")}
              />
            </label>
            <label
              className={`fieldBlock${miss("w4OtherDependents", missingFields)}`}
              data-field="w4OtherDependents"
            >
              <span className="fieldLabel">{t("quietW4OtherDependents")}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={answers.w4OtherDependents}
                onChange={(e) => set("w4OtherDependents", formatDependentCountInput(e.target.value))}
                placeholder="0"
                aria-invalid={missingFields.includes("w4OtherDependents")}
              />
            </label>
          </div>
          <p className="quietDependentsTotal">
            {t("quietW4DependentsTotal", {
              amount: step3Amounts.step3Total.toLocaleString(),
            })}
          </p>
        </div>

        <fieldset className={`quietChoice${missingFields.includes("citizenshipStatus") ? " fieldMissing" : ""}`}>
          <legend className="quietChoiceLabel">{t("quietI9Citizenship")}</legend>
          <div className="quietList">
            {citizenshipOptions.map(([val, labelKey]) => (
              <label key={val} className={answers.citizenshipStatus === val ? "isOn" : ""}>
                <input
                  type="radio"
                  name="citizenshipStatus"
                  checked={answers.citizenshipStatus === val}
                  onChange={() => set("citizenshipStatus", val)}
                />
                {t(labelKey)}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={`quietBlock${signatureMissing ? " quietBlockWarn" : ""}`} id="signature-section">
        <h2 className="quietHeading">{t("sectionSignature")}</h2>
        <p className="quietHint">
          {t("quietSignatureHint")}
          {signature ? t("quietSignatureCaptured") : ""}
        </p>
        <SignaturePad
          key={signatureSession}
          onChange={(dataUrl) =>
            onSignatureChange(dataUrl ? encodeDrawnSignature(dataUrl) : "")
          }
        />
        {signatureMissing && <p className="infoFieldError">{t("quietSignatureRequired")}</p>}
      </section>

      <section className="quietBlock">
        <h2 className="quietHeading">{t("sectionDirectDeposit")}</h2>
        <p className="quietHint">{t("quietDirectDepositHint")}</p>
        <DirectDepositForm
          ref={directDepositRef}
          values={directDepositValues}
          onChange={onDirectDepositChange}
        />
      </section>
    </div>
  );
}
