import { NextResponse } from "next/server";
import { normalizeApplicantName, isApplicantNameComplete } from "@/lib/employee-onboarding/applicantName";
import {
  buildSubmissionPacket,
  normalizeSubmissionFormValues,
} from "@/lib/employee-onboarding/buildSubmissionPacket";
import { normalizeDirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import type { FormValuesState } from "@/lib/employee-onboarding/loadDraft";
import type { DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import { sendSubmissionEmail } from "@/lib/employee-onboarding/sendSubmissionEmail";
import type { PdfStampField } from "@/lib/employee-onboarding/extractPdfStampFields";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import type { OnboardingFormId } from "@/lib/employee-onboarding/pdfForms";

export const runtime = "nodejs";
export const maxDuration = 60;

type SubmitBody = {
  firstName?: string;
  lastName?: string;
  /** Applying-from office state (OR / UT / ID / TX) — used in the email subject. */
  state?: string;
  packetId?: string;
  locale?: Locale;
  formValues?: Partial<FormValuesState>;
  directDepositValues?: Partial<DirectDepositValues>;
  stampFields?: Partial<Record<OnboardingFormId, PdfStampField[]>>;
  /** @deprecated Large base64 payloads are rejected by many hosts; send formValues instead. */
  pdfBase64?: string;
};

function normalizeLocale(value: unknown): Locale {
  return value === "es" ? "es" : "en";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;
    const applicantName = normalizeApplicantName({
      firstName: body.firstName,
      lastName: body.lastName,
    });

    if (!isApplicantNameComplete(applicantName)) {
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
    }

    let pdfBytes: Buffer;
    const locale = normalizeLocale(body.locale);
    if (body.formValues) {
      const packetResult = await buildSubmissionPacket(
        normalizeSubmissionFormValues(body.formValues),
        normalizeDirectDepositValues(body.directDepositValues),
        locale,
        body.stampFields
      );
      pdfBytes = Buffer.from(packetResult.pdfBytes);
    } else if (body.pdfBase64 && typeof body.pdfBase64 === "string") {
      pdfBytes = Buffer.from(body.pdfBase64, "base64");
    } else {
      return NextResponse.json(
        { error: "Form data is required to build the onboarding packet." },
        { status: 400 }
      );
    }

    if (pdfBytes.length === 0) {
      return NextResponse.json({ error: "PDF attachment is empty." }, { status: 400 });
    }

    await sendSubmissionEmail({
      applicantName,
      state: typeof body.state === "string" ? body.state : undefined,
      pdfBytes,
      packetId: typeof body.packetId === "string" ? body.packetId : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Submit email failed:", error);
    const message = error instanceof Error ? error.message : "Email delivery failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
