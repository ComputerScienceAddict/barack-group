export type ApplicantName = {
  firstName: string;
  lastName: string;
};

export const EMPTY_APPLICANT_NAME: ApplicantName = {
  firstName: "",
  lastName: "",
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

export function buildWorkDocumentsBasename(name: ApplicantName): string {
  const first = slugNamePart(name.firstName) || "applicant";
  const last = slugNamePart(name.lastName) || "employee";
  return `${first}-${last}-workdocs`;
}

export function buildWorkDocumentsSubject(name: ApplicantName): string {
  return buildWorkDocumentsBasename(name);
}

export function buildWorkDocumentsFilename(name: ApplicantName): string {
  return `${buildWorkDocumentsBasename(name)}.pdf`;
}
