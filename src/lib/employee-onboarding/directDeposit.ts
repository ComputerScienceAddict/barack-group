import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { MissingFieldIssue } from "@/lib/employee-onboarding/fieldLabels";
import type { MessageKey } from "@/lib/employee-onboarding/i18n";

export type DirectDepositValues = {
  wantsDirectDeposit: boolean | null;
  employeeName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: "checking" | "savings" | "";
  authorization: boolean;
  signature: string;
};

export const EMPTY_DIRECT_DEPOSIT_VALUES: DirectDepositValues = {
  wantsDirectDeposit: null,
  employeeName: "",
  bankName: "",
  routingNumber: "",
  accountNumber: "",
  confirmAccountNumber: "",
  accountType: "",
  authorization: false,
  signature: "",
};

export function normalizeDirectDepositValues(
  values: Partial<DirectDepositValues> | undefined
): DirectDepositValues {
  if (!values) return EMPTY_DIRECT_DEPOSIT_VALUES;
  return {
    ...EMPTY_DIRECT_DEPOSIT_VALUES,
    ...values,
    wantsDirectDeposit: values.wantsDirectDeposit ?? null,
  };
}

export function usesDirectDeposit(values: DirectDepositValues): boolean {
  return values.wantsDirectDeposit === true;
}

export function hasDirectDepositAnswer(values: DirectDepositValues): boolean {
  return values.wantsDirectDeposit !== null;
}

export function clearDirectDepositBankFields(
  values: DirectDepositValues
): DirectDepositValues {
  return {
    ...EMPTY_DIRECT_DEPOSIT_VALUES,
    wantsDirectDeposit: values.wantsDirectDeposit,
  };
}

const ROUTING_NUMBER_PATTERN = /^\d{9}$/;

function isFilled(value: string) {
  return value.trim().length > 0;
}

export function getMissingDirectDepositIssues(values: DirectDepositValues): MissingFieldIssue[] {
  if (!hasDirectDepositAnswer(values)) {
    return [
      {
        fieldKey: "wantsDirectDeposit",
        labelKey: "fieldDirectDepositChoice",
        scrollTarget: "wantsDirectDeposit",
      },
    ];
  }

  if (!usesDirectDeposit(values)) {
    return [];
  }

  const issues: MissingFieldIssue[] = [];

  const checks: Array<{ key: keyof DirectDepositValues; labelKey: MessageKey; when?: boolean }> = [
    { key: "employeeName", labelKey: "fieldDirectDepositEmployeeName" },
    { key: "bankName", labelKey: "fieldDirectDepositBankName" },
    { key: "routingNumber", labelKey: "fieldDirectDepositRouting" },
    { key: "accountNumber", labelKey: "fieldDirectDepositAccount" },
    { key: "confirmAccountNumber", labelKey: "fieldDirectDepositConfirmAccount" },
    { key: "accountType", labelKey: "fieldDirectDepositAccountType" },
    { key: "signature", labelKey: "fieldDirectDepositSignature" },
    { key: "authorization", labelKey: "fieldDirectDepositAuthorization" },
  ];

  for (const check of checks) {
    if (check.key === "authorization") {
      if (!values.authorization) {
        issues.push({
          fieldKey: check.key,
          labelKey: check.labelKey,
          scrollTarget: check.key,
        });
      }
      continue;
    }

    if (check.key === "accountType") {
      if (!values.accountType) {
        issues.push({
          fieldKey: check.key,
          labelKey: check.labelKey,
          scrollTarget: check.key,
        });
      }
      continue;
    }

    const value = values[check.key];
    if (typeof value !== "string" || !isFilled(value)) {
      issues.push({
        fieldKey: check.key,
        labelKey: check.labelKey,
        scrollTarget: check.key,
      });
    }
  }

  if (isFilled(values.routingNumber) && !ROUTING_NUMBER_PATTERN.test(values.routingNumber.trim())) {
    if (!issues.some((issue) => issue.fieldKey === "routingNumber")) {
      issues.push({
        fieldKey: "routingNumber",
        labelKey: "fieldDirectDepositRoutingInvalid",
        scrollTarget: "routingNumber",
      });
    }
  }

  if (
    isFilled(values.accountNumber) &&
    isFilled(values.confirmAccountNumber) &&
    values.accountNumber.trim() !== values.confirmAccountNumber.trim()
  ) {
    if (!issues.some((issue) => issue.fieldKey === "confirmAccountNumber")) {
      issues.push({
        fieldKey: "confirmAccountNumber",
        labelKey: "fieldDirectDepositAccountMismatch",
        scrollTarget: "confirmAccountNumber",
      });
    }
  }

  return issues;
}

function formatToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}/${day}/${year}`;
}

export async function buildDirectDepositPdfBytes(values: DirectDepositValues): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 740;
  const left = 54;
  const lineHeight = 18;

  const drawLine = (text: string, size = 11, font = regular) => {
    page.drawText(text, { x: left, y, size, font, color: rgb(0.07, 0.09, 0.16) });
    y -= lineHeight;
  };

  page.drawText("Direct Deposit Authorization", {
    x: left,
    y,
    size: 18,
    font: bold,
    color: rgb(0.07, 0.09, 0.16),
  });
  y -= 28;

  drawLine("Barak Group Corporation — New Hire Payroll Setup", 12, bold);
  y -= 6;

  const paragraphs = [
    "I authorize Barak Group Corporation to deposit my net pay into the bank account listed below.",
    "This authorization remains in effect until I submit a written change request.",
    "I understand that incorrect banking information may delay payment.",
  ];

  for (const paragraph of paragraphs) {
    page.drawText(paragraph, {
      x: left,
      y,
      size: 10,
      font: regular,
      color: rgb(0.2, 0.25, 0.33),
      maxWidth: 504,
    });
    y -= 32;
  }

  y -= 8;

  const fields: Array<[string, string]> = [
    ["Employee name", values.employeeName.trim()],
    ["Bank name", values.bankName.trim()],
    ["Routing number", values.routingNumber.trim()],
    ["Account number", values.accountNumber.trim()],
    ["Account type", values.accountType === "checking" ? "Checking" : "Savings"],
    ["Signature", values.signature.trim()],
    ["Date", formatToday()],
  ];

  for (const [label, value] of fields) {
    page.drawText(`${label}:`, { x: left, y, size: 10, font: bold, color: rgb(0.07, 0.09, 0.16) });
    page.drawText(value || "—", {
      x: left + 140,
      y,
      size: 10,
      font: regular,
      color: rgb(0.07, 0.09, 0.16),
      maxWidth: 360,
    });
    y -= lineHeight + 4;
  }

  y -= 10;
  page.drawText(
    values.authorization
      ? "Authorization accepted: Yes"
      : "Authorization accepted: No",
    { x: left, y, size: 10, font: bold, color: rgb(0.07, 0.09, 0.16) }
  );

  return doc.save();
}
