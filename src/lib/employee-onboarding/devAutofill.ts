import type { ApplicantName } from "@/lib/employee-onboarding/applicantName";
import type { DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import type { FormValuesState } from "@/lib/employee-onboarding/loadDraft";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import type { OnboardingAnswers } from "@/lib/employee-onboarding/onboardingAnswers";
import { encodeDrawnSignature } from "@/lib/employee-onboarding/signatureFields";

/** Visible block signature PNG used for local autofill only. */
const DEV_SIGNATURE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAwCAYAAABUmTXqAAAAxklEQVR4nO3ZoREAMQwDQfff9H8FEZXA7sxxE5HkPuDp2gfAMgOBwEAgMBAIDAQCA4HAQCC4u/skPasfIC1XP0Barn6AtFz9AGm5+gHScvUDpN3a78ywzEAgMBAIDAQCA4HAK5aUqx8gLVc/QFqufoC0XP0Aabn6AdJy9QOk3drvzLDMQCAwEAgMBAIDgcBAIDAQCPyDSLn6AdJy9QOk5eoHSMvVD5CWqx8gLVc/QNqt/c4MywwEAgOBwEAgMBAIDAQCA4HgBx6ZaRWtJYK1AAAAAElFTkSuQmCC";

export function isDevAutofillEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

function devDrawnSignature(): string {
  return encodeDrawnSignature(DEV_SIGNATURE_DATA_URL);
}

function formatToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export type QuietAutofillPayload = {
  answers: OnboardingAnswers;
  signature: string;
  directDeposit: DirectDepositValues;
};

/** Sample data for the quiet onboarding form (answers + signature + DD). */
export function getQuietAutofillPayload(locale: Locale): QuietAutofillPayload {
  const signature = devDrawnSignature();

  if (locale === "es") {
    return {
      answers: {
        firstName: "Juan",
        lastName: "Prueba",
        middleInitial: "A",
        ssn: "111-11-1111",
        dateOfBirth: "1990-01-01",
        phone: "555-000-0101",
        email: "juan.prueba@example.com",
        address: "123 Calle Test",
        city: "Detroit",
        state: "MI",
        zip: "48201",
        age18: true,
        positions: ["full_time"],
        shifts: ["day"],
        travel: true,
        overtime: true,
        authorizedToWork: true,
        emergency1Name: "Contacto Uno",
        emergency1Relationship: "Amigo",
        emergency1Phone: "555-000-0102",
        emergency1AltPhone: "555-000-0103",
        emergency2Name: "Contacto Dos",
        emergency2Relationship: "Hermano",
        emergency2Phone: "555-000-0104",
        emergency2AltPhone: "555-000-0105",
        w4FilingStatus: 0,
        w4QualifyingChildren: "1",
        w4OtherDependents: "0",
        citizenshipStatus: 1,
      },
      signature,
      directDeposit: {
        wantsDirectDeposit: false,
        employeeName: "Juan Prueba",
        bankName: "",
        routingNumber: "",
        accountNumber: "",
        confirmAccountNumber: "",
        accountType: "",
        authorization: false,
        signature: "",
      },
    };
  }

  return {
    answers: {
      firstName: "John",
      lastName: "Doe",
      middleInitial: "Q",
      ssn: "123-45-6789",
      dateOfBirth: "1990-01-15",
      phone: "555-123-4567",
      email: "john.doe@example.com",
      address: "123 Main Street",
      city: "Detroit",
      state: "MI",
      zip: "48201",
      age18: true,
      positions: ["full_time"],
      shifts: ["day", "weekends"],
      travel: true,
      overtime: true,
      authorizedToWork: true,
      emergency1Name: "Jane Doe",
      emergency1Relationship: "Spouse",
      emergency1Phone: "555-987-6543",
      emergency1AltPhone: "555-111-2222",
      emergency2Name: "Jim Doe",
      emergency2Relationship: "Brother",
      emergency2Phone: "555-333-4444",
      emergency2AltPhone: "555-555-6666",
      w4FilingStatus: 0,
      w4QualifyingChildren: "1",
      w4OtherDependents: "0",
      citizenshipStatus: 1,
    },
    signature,
    directDeposit: {
      wantsDirectDeposit: false,
      employeeName: "John Doe",
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      confirmAccountNumber: "",
      accountType: "",
      authorization: false,
      signature: "",
    },
  };
}

export type DevAutofillPayload = {
  applicantName: ApplicantName;
  formValues: FormValuesState;
  directDeposit: DirectDepositValues;
};

export function getDevAutofillPayload(locale: Locale): DevAutofillPayload {
  const today = formatToday();
  const signature = devDrawnSignature();
  const quiet = getQuietAutofillPayload(locale);

  if (locale === "es") {
    return {
      applicantName: { firstName: quiet.answers.firstName, lastName: quiet.answers.lastName },
      formValues: {
        employment: {
          fecha_solicitud: today,
          apellido: quiet.answers.lastName,
          nombre: quiet.answers.firstName,
          numero_telefono: quiet.answers.phone,
          ssn_1: "111",
          ssn_2: "11",
          ssn_3: "1111",
          direccion: quiet.answers.address,
          ciudad: quiet.answers.city,
          estado: quiet.answers.state,
          codigo_postal: quiet.answers.zip,
          correo_electronico: quiet.answers.email,
          mayor_18_si: true,
          empleo_tiempo_completo: true,
          turno_dia: true,
          dispuesto_viajar_si: true,
          horas_extra_si: true,
          autorizado_trabajar_si: true,
          emergencia_nombre_1: quiet.answers.emergency1Name,
          emergencia_relacion_1: quiet.answers.emergency1Relationship,
          emergencia_telefono_1: quiet.answers.emergency1Phone,
          emergencia_telefono_alterno_1: quiet.answers.emergency1AltPhone,
          emergencia_nombre_2: quiet.answers.emergency2Name,
          emergencia_relacion_2: quiet.answers.emergency2Relationship,
          emergencia_telefono_2: quiet.answers.emergency2Phone,
          emergencia_telefono_alterno_2: quiet.answers.emergency2AltPhone,
          firma_solicitante: signature,
          fecha_firma: today,
        },
        w4: {
          "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": quiet.answers.firstName,
          "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": quiet.answers.lastName,
          "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]": quiet.answers.address,
          "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]": `${quiet.answers.city}, ${quiet.answers.state} ${quiet.answers.zip}`,
          "topmostSubform[0].Page1[0].f1_05[0]": quiet.answers.ssn,
          "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]": "2000",
          "topmostSubform[0].Page1[0].f1_07[0]": "0",
          "topmostSubform[0].Page1[0].f1_08[0]": "2000",
          "topmostSubform[0].Page1[0].c1_1[0]": true,
          employee_signature_step5_sp: signature,
          employee_date_step5_sp: today,
        },
        i9: {
          "Last Name (Family Name)": quiet.answers.lastName,
          "First Name Given Name": quiet.answers.firstName,
          "Address Street Number and Name": quiet.answers.address,
          "City or Town": quiet.answers.city,
          State: quiet.answers.state,
          "ZIP Code": quiet.answers.zip,
          "Date of Birth mmddyyyy": "01/01/1990",
          "US Social Security Number": "111111111",
          "Employees E-mail Address": quiet.answers.email,
          "Telephone Number": quiet.answers.phone,
          CB_1: true,
          "Signature of Employee": signature,
          "Today's Date mmddyyy": today,
        },
        wh151: {
          WorkerSignature: signature,
          Text440: `${quiet.answers.firstName} ${quiet.answers.lastName}`,
          Text441: today,
        },
      },
      directDeposit: quiet.directDeposit,
    };
  }

  return {
    applicantName: { firstName: quiet.answers.firstName, lastName: quiet.answers.lastName },
    formValues: {
      employment: {
        date_of_application: today,
        last_name: quiet.answers.lastName,
        first_name: quiet.answers.firstName,
        middle_initial: quiet.answers.middleInitial,
        phone_number: quiet.answers.phone,
        ssn: quiet.answers.ssn,
        address: quiet.answers.address,
        city: quiet.answers.city,
        state: quiet.answers.state,
        zip_code: quiet.answers.zip,
        email_address: quiet.answers.email,
        age_18_yes: true,
        position_full_time: true,
        shift_day: true,
        travel_yes: true,
        overtime_yes: true,
        authorized_yes: true,
        emergency_1_full_name: quiet.answers.emergency1Name,
        emergency_1_relationship: quiet.answers.emergency1Relationship,
        emergency_1_phone: quiet.answers.emergency1Phone,
        emergency_1_alt_phone: quiet.answers.emergency1AltPhone,
        emergency_2_full_name: quiet.answers.emergency2Name,
        emergency_2_relationship: quiet.answers.emergency2Relationship,
        emergency_2_phone: quiet.answers.emergency2Phone,
        emergency_2_alt_phone: quiet.answers.emergency2AltPhone,
        applicant_signature: signature,
        applicant_signature_date: today,
      },
      w4: {
        "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": quiet.answers.firstName,
        "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": quiet.answers.lastName,
        "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": quiet.answers.address,
        "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": `${quiet.answers.city}, ${quiet.answers.state} ${quiet.answers.zip}`,
        "topmostSubform[0].Page1[0].f1_05[0]": quiet.answers.ssn,
        "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]": "2000",
        "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]": "0",
        "topmostSubform[0].Page1[0].f1_08[0]": "2000",
        "topmostSubform[0].Page1[0].c1_1[0]": true,
        employee_signature_step5: signature,
        employee_date_step5: today,
      },
      i9: {
        "Last Name (Family Name)": quiet.answers.lastName,
        "First Name Given Name": quiet.answers.firstName,
        "Address Street Number and Name": quiet.answers.address,
        "City or Town": quiet.answers.city,
        State: quiet.answers.state,
        "ZIP Code": quiet.answers.zip,
        "Date of Birth mmddyyyy": "01/15/1990",
        "US Social Security Number": "123456789",
        "Employees E-mail Address": quiet.answers.email,
        "Telephone Number": quiet.answers.phone,
        CB_1: true,
        "Signature of Employee": signature,
        "Today's Date mmddyyy": today,
      },
      wh151: {
        WorkerSignature: signature,
        Text440: `${quiet.answers.firstName} ${quiet.answers.lastName}`,
        Text441: today,
      },
    },
    directDeposit: quiet.directDeposit,
  };
}
