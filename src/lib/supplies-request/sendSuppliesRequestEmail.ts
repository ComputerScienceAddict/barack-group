import { sendTextEmail } from "@/lib/mail/sendMail";
import {
  buildSuppliesRequestBody,
  buildSuppliesRequestSubject,
  getSuppliesRequestRecipients,
  type SuppliesRequestPayload,
} from "@/lib/supplies-request/formatSuppliesRequestEmail";

export type { SuppliesRequestPayload };

export async function sendSuppliesRequestEmail(payload: SuppliesRequestPayload) {
  await sendTextEmail({
    to: getSuppliesRequestRecipients(),
    fromName: "Barak Group Supplies",
    subject: buildSuppliesRequestSubject(payload),
    text: buildSuppliesRequestBody(payload),
  });
}
