import { SUPPLIES_REQUEST_RECIPIENTS } from "@/lib/supplies-request/constants";

export type SuppliesRequestPayload = {
  name: string;
  location: string;
  supplies: string[];
};

export function buildSuppliesRequestSubject(payload: SuppliesRequestPayload) {
  return `Supplies request — ${payload.name} (${payload.location})`;
}

export function buildSuppliesRequestBody(payload: SuppliesRequestPayload, submittedAt = new Date()) {
  const lines = [
    "Supplies request",
    "",
    `Name: ${payload.name}`,
    `Location: ${payload.location}`,
    "",
    "Items:",
    ...payload.supplies.map((item, index) => `${index + 1}. ${item}`),
    "",
    `Submitted: ${submittedAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT`,
  ];

  return lines.join("\n");
}

export function getSuppliesRequestRecipients() {
  const envRecipients = process.env.SUPPLIES_REQUEST_TO?.trim();
  if (envRecipients) {
    return envRecipients.split(/[,;]/).map((entry) => entry.trim()).filter(Boolean);
  }
  return [...SUPPLIES_REQUEST_RECIPIENTS];
}
