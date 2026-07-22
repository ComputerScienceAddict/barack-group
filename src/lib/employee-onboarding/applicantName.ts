export type ApplicantName = {
  firstName: string;
  lastName: string;
};

export const EMPTY_APPLICANT_NAME: ApplicantName = {
  firstName: "",
  lastName: "",
};

/** USPS state / territory codes → full English name for email subjects. */
const STATE_CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export function normalizeApplicantName(value: Partial<ApplicantName> | null | undefined): ApplicantName {
  return {
    firstName: typeof value?.firstName === "string" ? value.firstName.trim() : "",
    lastName: typeof value?.lastName === "string" ? value.lastName.trim() : "",
  };
}

export function isApplicantNameComplete(name: ApplicantName): boolean {
  return name.firstName.length > 0 && name.lastName.length > 0;
}

function slugNamePart(part: string): string {
  return part
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolve a state code or name to the full English display name (e.g. TX → "Texas").
 * Returns empty string when unknown/blank.
 */
export function resolveStateDisplayName(state: string | null | undefined): string {
  const raw = String(state ?? "").trim();
  if (!raw) return "";

  const upper = raw.toUpperCase();
  if (STATE_CODE_TO_NAME[upper]) {
    return STATE_CODE_TO_NAME[upper];
  }

  const matched = Object.values(STATE_CODE_TO_NAME).find(
    (name) => name.toLowerCase() === raw.toLowerCase()
  );
  if (matched) return matched;

  // Title-case unknown input as a fallback.
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/**
 * Resolve a state code or name to a subject/filename slug (e.g. TX / Texas → "texas").
 * Returns empty string when unknown/blank so callers can omit it.
 */
export function resolveStateSubjectSlug(state: string | null | undefined): string {
  const display = resolveStateDisplayName(state);
  return display ? slugNamePart(display) : "";
}

/**
 * Email subjects cannot use real HTML bold. Convert letters to Mathematical Bold
 * Unicode so the state stands out at a glance in the inbox (𝗧𝗲𝘅𝗮𝘀, 𝗢𝗿𝗲𝗴𝗼𝗻, …).
 */
function toBoldUnicode(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x41 && code <= 0x5a) {
      // A-Z
      out += String.fromCodePoint(0x1d400 + (code - 0x41));
    } else if (code >= 0x61 && code <= 0x7a) {
      // a-z
      out += String.fromCodePoint(0x1d41a + (code - 0x61));
    } else {
      out += ch;
    }
  }
  return out;
}

export type WorkDocumentsLabelInput = {
  applicantName: ApplicantName;
  /** USPS code (TX) or full name (Texas) from the application address. */
  state?: string | null;
};

function resolveLabelInput(input: ApplicantName | WorkDocumentsLabelInput): WorkDocumentsLabelInput {
  return "applicantName" in input ? input : { applicantName: input, state: undefined };
}

function nameSlugParts(applicantName: ApplicantName): { first: string; last: string } {
  return {
    first: slugNamePart(applicantName.firstName) || "applicant",
    last: slugNamePart(applicantName.lastName) || "employee",
  };
}

/** ASCII basename used for PDF filenames (state first for sorting by state). */
export function buildWorkDocumentsBasename(input: ApplicantName | WorkDocumentsLabelInput): string {
  const { applicantName, state } = resolveLabelInput(input);
  const { first, last } = nameSlugParts(applicantName);
  const stateSlug = resolveStateSubjectSlug(state);
  if (stateSlug) {
    return `${stateSlug}-${first}-${last}-workdocs`;
  }
  return `${first}-${last}-workdocs`;
}

/**
 * Inbox subject: bold full state name first, then the applicant slug.
 * Example: "𝗧𝗲𝘅𝗮𝘀 — john-doe-workdocs"
 */
export function buildWorkDocumentsSubject(input: ApplicantName | WorkDocumentsLabelInput): string {
  const { applicantName, state } = resolveLabelInput(input);
  const { first, last } = nameSlugParts(applicantName);
  const namePart = `${first}-${last}-workdocs`;
  const stateName = resolveStateDisplayName(state);
  if (stateName) {
    return `${toBoldUnicode(stateName)} — ${namePart}`;
  }
  return namePart;
}

export function buildWorkDocumentsFilename(input: ApplicantName | WorkDocumentsLabelInput): string {
  return `${buildWorkDocumentsBasename(input)}.pdf`;
}
