import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import type { FormValuesState } from "@/lib/employee-onboarding/loadDraft";

export type PositionType = "full_time" | "part_time" | "temporary" | "on_call";
export type ShiftType = "day" | "afternoon" | "night" | "weekends" | "any";
export type CitizenshipStatus = 1 | 2 | 3 | 4;
export type FilingStatus = 0 | 1 | 2;
/** Office / hiring state the applicant is applying from (email subject). */
export type ApplyingFromState = "OR" | "UT" | "ID" | "TX";

export const APPLYING_FROM_STATES: ReadonlyArray<{
  code: ApplyingFromState;
  name: string;
}> = [
  { code: "OR", name: "Oregon" },
  { code: "UT", name: "Utah" },
  { code: "ID", name: "Idaho" },
  { code: "TX", name: "Texas" },
];

export function isApplyingFromState(value: string | null | undefined): value is ApplyingFromState {
  return APPLYING_FROM_STATES.some((entry) => entry.code === value);
}

export type OnboardingAnswers = {
  firstName: string;
  lastName: string;
  middleInitial: string;
  ssn: string;
  dateOfBirth: string; // YYYY-MM-DD (HTML date input value)
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  /** Which Barak office state they are applying from (OR / UT / ID / TX). */
  applyingFromState: ApplyingFromState | "";
  age18: boolean | null;
  positions: PositionType[];
  shifts: ShiftType[];
  travel: boolean | null;
  overtime: boolean | null;
  authorizedToWork: boolean | null;
  emergency1Name: string;
  emergency1Relationship: string;
  emergency1Phone: string;
  emergency1AltPhone: string;
  emergency2Name: string;
  emergency2Relationship: string;
  emergency2Phone: string;
  emergency2AltPhone: string;
  w4FilingStatus: FilingStatus | null;
  /** Qualifying children under age 17 (W-4 Step 3a). Count only — we multiply by $2,000. */
  w4QualifyingChildren: string;
  /** Other dependents (W-4 Step 3b). Count only — we multiply by $500. */
  w4OtherDependents: string;
  citizenshipStatus: CitizenshipStatus | null;
};

export const EMPTY_ANSWERS: OnboardingAnswers = {
  firstName: "",
  lastName: "",
  middleInitial: "",
  ssn: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  applyingFromState: "",
  age18: null,
  positions: [],
  shifts: [],
  travel: null,
  overtime: null,
  authorizedToWork: null,
  emergency1Name: "",
  emergency1Relationship: "",
  emergency1Phone: "",
  emergency1AltPhone: "",
  emergency2Name: "",
  emergency2Relationship: "",
  emergency2Phone: "",
  emergency2AltPhone: "",
  w4FilingStatus: null,
  w4QualifyingChildren: "",
  w4OtherDependents: "",
  citizenshipStatus: null,
};

const W4_CHILD_CREDIT = 2000;
const W4_OTHER_DEPENDENT_CREDIT = 500;

function parseDependentCount(value: string): number {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  return Math.min(99, Number.parseInt(digits, 10) || 0);
}

/** Keep only digits while typing a dependent count (max 2 digits). */
export function formatDependentCountInput(value: string): string {
  return String(value ?? "").replace(/\D/g, "").slice(0, 2);
}

/** Turn dependent counts into W-4 Step 3 dollar amounts. */
export function computeW4Step3Amounts(
  answers: Pick<OnboardingAnswers, "w4QualifyingChildren" | "w4OtherDependents">
) {
  const children = parseDependentCount(answers.w4QualifyingChildren);
  const other = parseDependentCount(answers.w4OtherDependents);
  const step3a = children * W4_CHILD_CREDIT;
  const step3b = other * W4_OTHER_DEPENDENT_CREDIT;
  return {
    children,
    other,
    step3a,
    step3b,
    step3Total: step3a + step3b,
  };
}

function getTodayMDY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function isoToMDY(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function rawDigits(ssn: string): string {
  return String(ssn ?? "").replace(/\D/g, "").slice(0, 9);
}

/** Format as XXX-XX-XXXX while typing / pasting. */
export function formatSsnInput(value: string): string {
  const d = rawDigits(value);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

function formatSsn(ssn: string): string {
  const d = rawDigits(ssn);
  if (d.length === 9) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  return formatSsnInput(ssn);
}

export function isCompleteSsn(ssn: string): boolean {
  return rawDigits(ssn).length === 9;
}

/**
 * Convert collected OnboardingAnswers + drawn signature into the
 * FormValuesState expected by buildOnboardingPacket.  All four PDF
 * forms (employment EN+ES, W-4 EN+ES, I-9, WH-151) are populated so
 * every template can be rendered without asking the applicant to re-enter data.
 */
export function mapAnswersToPdfValues(
  answers: OnboardingAnswers,
  signature: string
): FormValuesState {
  const today = getTodayMDY();
  const ssnFmt = formatSsn(answers.ssn);
  const ssnRaw = rawDigits(answers.ssn);
  const ssn1 = ssnRaw.slice(0, 3);
  const ssn2 = ssnRaw.slice(3, 5);
  const ssn3 = ssnRaw.slice(5, 9);
  const fullName = `${answers.firstName} ${answers.lastName}`.trim();
  const w4CityStateZip = `${answers.city}, ${answers.state} ${answers.zip}`.trim();
  const dob = isoToMDY(answers.dateOfBirth);

  const pos = answers.positions;
  const shf = answers.shifts;

  const employment: Record<string, PdfFieldValue> = {
    // ── English fields ──────────────────────────────────────────────
    date_of_application: today,
    last_name: answers.lastName,
    first_name: answers.firstName,
    middle_initial: answers.middleInitial,
    phone_number: answers.phone,
    ssn: ssnFmt,
    ssn_1: ssn1,
    ssn_2: ssn2,
    ssn_3: ssn3,
    address: answers.address,
    city: answers.city,
    state: answers.state,
    zip_code: answers.zip,
    email_address: answers.email,
    age_18_yes: answers.age18 === true,
    age_18_no: answers.age18 === false,
    position_full_time: pos.includes("full_time"),
    position_part_time: pos.includes("part_time"),
    position_temporary: pos.includes("temporary"),
    position_on_call: pos.includes("on_call"),
    shift_day: shf.includes("day"),
    shift_afternoon: shf.includes("afternoon"),
    shift_night: shf.includes("night"),
    shift_weekends: shf.includes("weekends"),
    shift_any: shf.includes("any"),
    travel_yes: answers.travel === true,
    travel_no: answers.travel === false,
    overtime_yes: answers.overtime === true,
    overtime_no: answers.overtime === false,
    authorized_yes: answers.authorizedToWork === true,
    authorized_no: answers.authorizedToWork === false,
    emergency_1_full_name: answers.emergency1Name,
    emergency_1_relationship: answers.emergency1Relationship,
    emergency_1_phone: answers.emergency1Phone,
    emergency_1_alt_phone: answers.emergency1AltPhone,
    emergency_2_full_name: answers.emergency2Name,
    emergency_2_relationship: answers.emergency2Relationship,
    emergency_2_phone: answers.emergency2Phone,
    emergency_2_alt_phone: answers.emergency2AltPhone,
    applicant_signature: signature,
    applicant_signature_date: today,
    // ── Spanish mirrors ─────────────────────────────────────────────
    fecha_solicitud: today,
    apellido: answers.lastName,
    nombre: answers.firstName,
    inicial_segundo_nombre: answers.middleInitial,
    numero_telefono: answers.phone,
    direccion: answers.address,
    ciudad: answers.city,
    estado: answers.state,
    codigo_postal: answers.zip,
    correo_electronico: answers.email,
    mayor_18_si: answers.age18 === true,
    mayor_18_no: answers.age18 === false,
    empleo_tiempo_completo: pos.includes("full_time"),
    empleo_medio_tiempo: pos.includes("part_time"),
    empleo_temporal: pos.includes("temporary"),
    empleo_por_llamada: pos.includes("on_call"),
    turno_dia: shf.includes("day"),
    turno_tarde: shf.includes("afternoon"),
    turno_noche: shf.includes("night"),
    turno_fines_semana: shf.includes("weekends"),
    turno_cualquiera: shf.includes("any"),
    dispuesto_viajar_si: answers.travel === true,
    dispuesto_viajar_no: answers.travel === false,
    horas_extra_si: answers.overtime === true,
    horas_extra_no: answers.overtime === false,
    autorizado_trabajar_si: answers.authorizedToWork === true,
    autorizado_trabajar_no: answers.authorizedToWork === false,
    emergencia_nombre_1: answers.emergency1Name,
    emergencia_relacion_1: answers.emergency1Relationship,
    emergencia_telefono_1: answers.emergency1Phone,
    emergencia_telefono_alterno_1: answers.emergency1AltPhone,
    emergencia_nombre_2: answers.emergency2Name,
    emergencia_relacion_2: answers.emergency2Relationship,
    emergencia_telefono_2: answers.emergency2Phone,
    emergencia_telefono_alterno_2: answers.emergency2AltPhone,
    firma_solicitante: signature,
    fecha_firma: today,
  };

  const { step3a, step3b, step3Total } = computeW4Step3Amounts(answers);
  const step3aStr = String(step3a);
  const step3bStr = String(step3b);
  const step3TotalStr = String(step3Total);

  const w4: Record<string, PdfFieldValue> = {
    // ── English Step 1 ──────────────────────────────────────────────
    "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": answers.firstName,
    "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": answers.lastName,
    "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": answers.address,
    "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": w4CityStateZip,
    "topmostSubform[0].Page1[0].f1_05[0]": ssnRaw,
    // ── English Step 3 (counts → dollar credits) ────────────────────
    "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]": step3aStr,
    "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]": step3bStr,
    "topmostSubform[0].Page1[0].f1_08[0]": step3TotalStr,
    // ── English Step 5 (signature / date) ───────────────────────────
    employee_signature_step5: signature,
    employee_date_step5: today,
    // ── Spanish Step 1 ──────────────────────────────────────────────
    "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": answers.firstName,
    "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": answers.lastName,
    "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]": answers.address,
    "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]": w4CityStateZip,
    // ── Spanish Step 3 ──────────────────────────────────────────────
    "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]": step3aStr,
    "topmostSubform[0].Page1[0].f1_07[0]": step3bStr,
    // ── Spanish Step 5 ──────────────────────────────────────────────
    employee_signature_step5_sp: signature,
    employee_date_step5_sp: today,
    // ── Filing status (one checkbox active) ─────────────────────────
    "topmostSubform[0].Page1[0].c1_1[0]": answers.w4FilingStatus === 0,
    "topmostSubform[0].Page1[0].c1_1[1]": answers.w4FilingStatus === 1,
    "topmostSubform[0].Page1[0].c1_1[2]": answers.w4FilingStatus === 2,
  };

  const i9: Record<string, PdfFieldValue> = {
    "Last Name (Family Name)": answers.lastName,
    "Last Name Family Name from Section 1": answers.lastName,
    "First Name Given Name": answers.firstName,
    "First Name Given Name from Section 1": answers.firstName,
    "Employee Middle Initial (if any)": answers.middleInitial,
    "Middle initial if any from Section 1": answers.middleInitial,
    "Address Street Number and Name": answers.address,
    "City or Town": answers.city,
    State: answers.state,
    "ZIP Code": answers.zip,
    "Date of Birth mmddyyyy": dob,
    "US Social Security Number": ssnRaw,
    "Employees E-mail Address": answers.email,
    "Telephone Number": answers.phone,
    "Signature of Employee": signature,
    "Today's Date mmddyyy": today,
    CB_1: answers.citizenshipStatus === 1,
    CB_2: answers.citizenshipStatus === 2,
    CB_3: answers.citizenshipStatus === 3,
    CB_4: answers.citizenshipStatus === 4,
  };

  const wh151: Record<string, PdfFieldValue> = {
    Text440: fullName,
    "nombre del empleado": fullName,
    Text441: today,
    WorkerSignature: signature,
  };

  return { employment, w4, i9, wh151 };
}

export type AnswersValidation = {
  isValid: boolean;
  missingFields: string[];
};

export function validateAnswers(answers: OnboardingAnswers): AnswersValidation {
  const missing: string[] = [];

  function req(key: string, value: string) {
    if (!value.trim()) missing.push(key);
  }

  req("firstName", answers.firstName);
  req("lastName", answers.lastName);
  req("dateOfBirth", answers.dateOfBirth);
  req("phone", answers.phone);
  req("email", answers.email);
  req("address", answers.address);
  req("city", answers.city);
  req("state", answers.state);
  req("zip", answers.zip);

  if (!isApplyingFromState(answers.applyingFromState)) missing.push("applyingFromState");
  if (!isCompleteSsn(answers.ssn)) missing.push("ssn");
  if (answers.age18 === null) missing.push("age18");
  if (answers.positions.length === 0) missing.push("positions");
  if (answers.shifts.length === 0) missing.push("shifts");
  if (answers.travel === null) missing.push("travel");
  if (answers.overtime === null) missing.push("overtime");
  if (answers.authorizedToWork === null) missing.push("authorizedToWork");

  req("emergency1Name", answers.emergency1Name);
  req("emergency1Relationship", answers.emergency1Relationship);
  req("emergency1Phone", answers.emergency1Phone);
  req("emergency1AltPhone", answers.emergency1AltPhone);
  req("emergency2Name", answers.emergency2Name);
  req("emergency2Relationship", answers.emergency2Relationship);
  req("emergency2Phone", answers.emergency2Phone);
  req("emergency2AltPhone", answers.emergency2AltPhone);

  if (answers.w4FilingStatus === null) missing.push("w4FilingStatus");
  if (answers.w4QualifyingChildren.trim() === "") missing.push("w4QualifyingChildren");
  if (answers.w4OtherDependents.trim() === "") missing.push("w4OtherDependents");
  if (answers.citizenshipStatus === null) missing.push("citizenshipStatus");

  return { isValid: missing.length === 0, missingFields: missing };
}
