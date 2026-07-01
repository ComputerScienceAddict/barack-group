import { NextResponse } from "next/server";
import { normalizeApplicantName, isApplicantNameComplete } from "@/lib/employee-onboarding/applicantName";
import { sendSubmissionEmail } from "@/lib/employee-onboarding/sendSubmissionEmail";

export const runtime = "nodejs";
export const maxDuration = 60;

type SubmitBody = {
  firstName?: string;
  lastName?: string;
  pdfBase64?: string;
  packetId?: string;
};

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

    if (!body.pdfBase64 || typeof body.pdfBase64 !== "string") {
      return NextResponse.json({ error: "PDF attachment is required." }, { status: 400 });
    }

    const pdfBytes = Buffer.from(body.pdfBase64, "base64");
    if (pdfBytes.length === 0) {
      return NextResponse.json({ error: "PDF attachment is empty." }, { status: 400 });
    }

    await sendSubmissionEmail({
      applicantName,
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
