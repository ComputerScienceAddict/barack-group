"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import {
  clearDirectDepositBankFields,
  usesDirectDeposit,
  type DirectDepositValues,
} from "@/lib/employee-onboarding/directDeposit";

export type DirectDepositFormHandle = {
  flushValues: () => DirectDepositValues;
  focusMissingFields: (fieldKeys: string[]) => boolean;
  clearMissingMarks: () => void;
};

type DirectDepositFormProps = {
  values: DirectDepositValues;
  onChange: (values: DirectDepositValues) => void;
  active?: boolean;
};

function DirectDepositFormInner(
  { values, onChange, active = true }: DirectDepositFormProps,
  ref: React.Ref<DirectDepositFormHandle>
) {
  const { t } = useLanguage();
  const valuesRef = useRef(values);
  const rootRef = useRef<HTMLDivElement>(null);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useImperativeHandle(ref, () => ({
    flushValues: () => valuesRef.current,
    focusMissingFields: (fieldKeys: string[]) => {
      setMissingKeys(fieldKeys);
      const root = rootRef.current;
      if (!root) return false;
      const firstKey = fieldKeys[0];
      const node = firstKey
        ? root.querySelector<HTMLElement>(`[data-field="${firstKey}"]`)
        : null;
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in node && typeof node.focus === "function") {
          node.focus();
        }
        return true;
      }
      return false;
    },
    clearMissingMarks: () => setMissingKeys([]),
  }));

  function updateField<K extends keyof DirectDepositValues>(key: K, value: DirectDepositValues[K]) {
    onChange({ ...valuesRef.current, [key]: value });
  }

  function chooseDirectDeposit(wants: boolean) {
    if (!wants) {
      onChange(clearDirectDepositBankFields({ ...valuesRef.current, wantsDirectDeposit: false }));
      return;
    }
    onChange({ ...valuesRef.current, wantsDirectDeposit: true });
  }

  const missingClass = (key: string) =>
    missingKeys.includes(key) ? " directDepositFieldMissing" : "";

  if (!active) return null;

  const showBankFields = usesDirectDeposit(values);
  const declinedDirectDeposit = values.wantsDirectDeposit === false;

  return (
    <div className="directDepositForm" ref={rootRef}>
      <div
        className={`directDepositQuestionCard${missingClass("wantsDirectDeposit")}`}
        data-field="wantsDirectDeposit"
        role="group"
        aria-labelledby="direct-deposit-question"
      >
        <h3 id="direct-deposit-question" className="directDepositQuestionTitle">
          {t("fieldDirectDepositChoice")}
        </h3>
        <p className="directDepositQuestionHelp">{t("fieldDirectDepositChoiceHelp")}</p>
        <div className="directDepositChoiceButtons">
          <button
            type="button"
            className={`choiceButton choiceButtonLarge${values.wantsDirectDeposit === true ? " choiceButtonActive" : ""}`}
            onClick={() => chooseDirectDeposit(true)}
            aria-pressed={values.wantsDirectDeposit === true}
          >
            {t("directDepositYes")}
          </button>
          <button
            type="button"
            className={`choiceButton choiceButtonLarge${values.wantsDirectDeposit === false ? " choiceButtonActive" : ""}`}
            onClick={() => chooseDirectDeposit(false)}
            aria-pressed={values.wantsDirectDeposit === false}
          >
            {t("directDepositNo")}
          </button>
        </div>
      </div>

      {declinedDirectDeposit && (
        <p className="plainText directDepositSkippedNote">{t("directDepositSkippedHint")}</p>
      )}

      {showBankFields && (
        <>
          <p className="plainText">{t("directDepositHint")}</p>
          <div className="noticeBox">{t("directDepositNotice")}</div>

          <div className="fieldGrid twoColumns">
            <label className={missingClass("employeeName")}>
              {t("fieldDirectDepositEmployeeName")}
              <input
                data-field="employeeName"
                value={values.employeeName}
                onChange={(event) => updateField("employeeName", event.target.value)}
                placeholder={t("fieldDirectDepositEmployeeNamePlaceholder")}
                autoComplete="name"
              />
            </label>

            <label className={missingClass("bankName")}>
              {t("fieldDirectDepositBankName")}
              <input
                data-field="bankName"
                value={values.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
                placeholder={t("fieldDirectDepositBankNamePlaceholder")}
                autoComplete="organization"
              />
            </label>

            <label className={missingClass("routingNumber")}>
              {t("fieldDirectDepositRouting")}
              <input
                data-field="routingNumber"
                value={values.routingNumber}
                onChange={(event) =>
                  updateField("routingNumber", event.target.value.replace(/\D/g, "").slice(0, 9))
                }
                inputMode="numeric"
                placeholder="123456789"
                autoComplete="off"
              />
            </label>

            <label className={missingClass("accountType")}>
              {t("fieldDirectDepositAccountType")}
              <select
                data-field="accountType"
                value={values.accountType}
                onChange={(event) =>
                  updateField("accountType", event.target.value as DirectDepositValues["accountType"])
                }
              >
                <option value="">{t("fieldDirectDepositAccountTypePlaceholder")}</option>
                <option value="checking">{t("fieldDirectDepositChecking")}</option>
                <option value="savings">{t("fieldDirectDepositSavings")}</option>
              </select>
            </label>

            <label className={missingClass("accountNumber")}>
              {t("fieldDirectDepositAccount")}
              <input
                data-field="accountNumber"
                value={values.accountNumber}
                onChange={(event) => updateField("accountNumber", event.target.value.replace(/\s/g, ""))}
                inputMode="numeric"
                placeholder={t("fieldDirectDepositAccountPlaceholder")}
                autoComplete="off"
              />
            </label>

            <label className={missingClass("confirmAccountNumber")}>
              {t("fieldDirectDepositConfirmAccount")}
              <input
                data-field="confirmAccountNumber"
                value={values.confirmAccountNumber}
                onChange={(event) =>
                  updateField("confirmAccountNumber", event.target.value.replace(/\s/g, ""))
                }
                inputMode="numeric"
                placeholder={t("fieldDirectDepositConfirmAccountPlaceholder")}
                autoComplete="off"
              />
            </label>

            <label className={missingClass("signature")}>
              {t("fieldDirectDepositSignature")}
              <input
                data-field="signature"
                value={values.signature}
                onChange={(event) => updateField("signature", event.target.value)}
                placeholder={t("fieldDirectDepositSignaturePlaceholder")}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="checkboxStack">
            <label className={`${missingClass("authorization")} authorizationLabel`}>
              <input
                data-field="authorization"
                type="checkbox"
                checked={values.authorization}
                onChange={(event) => updateField("authorization", event.target.checked)}
              />
              {t("fieldDirectDepositAuthorizationText")}
            </label>
          </div>
        </>
      )}
    </div>
  );
}

const DirectDepositForm = forwardRef(DirectDepositFormInner);
DirectDepositForm.displayName = "DirectDepositForm";

export default DirectDepositForm;
export { EMPTY_DIRECT_DEPOSIT_VALUES } from "@/lib/employee-onboarding/directDeposit";
