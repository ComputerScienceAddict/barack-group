import type { ApplicantName } from "@/lib/employee-onboarding/applicantName";
import type { DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import type { FormValuesState } from "@/lib/employee-onboarding/loadDraft";
import type { Locale } from "@/lib/employee-onboarding/i18n";
import { encodeDrawnSignature } from "@/lib/employee-onboarding/signatureFields";

/** Visible block signature PNG used for local dev autofill only. */
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

export type DevAutofillPayload = {
  applicantName: ApplicantName;
  formValues: FormValuesState;
  directDeposit: DirectDepositValues;
};

export function getDevAutofillPayload(locale: Locale): DevAutofillPayload {
  const today = formatToday();
  const signature = devDrawnSignature();

  if (locale === "es") {
    return {
      applicantName: { firstName: "Juan", lastName: "Prueba" },
      formValues: {
        employment: {
          fecha_solicitud: today,
          apellido: "Prueba",
          nombre: "Juan",
          numero_telefono: "555-000-0101",
          ssn_1: "111",
          ssn_2: "11",
          ssn_3: "1111",
          direccion: "123 Calle Test",
          ciudad: "Detroit",
          estado: "MI",
          codigo_postal: "48201",
          correo_electronico: "juan.prueba@example.com",
          mayor_18_si: true,
          empleo_tiempo_completo: true,
          turno_dia: true,
          dispuesto_viajar_si: true,
          horas_extra_si: true,
          autorizado_trabajar_si: true,
          emergencia_nombre_1: "Contacto Uno",
          emergencia_relacion_1: "Amigo",
          emergencia_telefono_1: "555-000-0102",
          emergencia_telefono_alterno_1: "555-000-0103",
          emergencia_nombre_2: "Contacto Dos",
          emergencia_relacion_2: "Hermano",
          emergencia_telefono_2: "555-000-0104",
          emergencia_telefono_alterno_2: "555-000-0105",
          firma_solicitante: signature,
          fecha_firma: today,
        },
        w4: {
          "topmostSubform[0].Page1[0].Paso1a[0].f1_01[0]": "Juan",
          "topmostSubform[0].Page1[0].Paso1a[0].f1_02[0]": "Prueba",
          "topmostSubform[0].Page1[0].Paso1a[0].f1_03[0]": "123 Calle Test",
          "topmostSubform[0].Page1[0].Paso1a[0].f1_04[0]": "Detroit, MI 48201",
          "topmostSubform[0].Page1[0].f1_05[0]": "111-11-1111",
          "topmostSubform[0].Page1[0].c1_1[0]": true,
          "topmostSubform[0].Page1[0].Paso3_ReadOrder[0].f1_06[0]": "0",
          "topmostSubform[0].Page1[0].f1_07[0]": "0",
          "topmostSubform[0].Page1[0].f1_08[0]": "0",
          employee_signature_step5_sp: signature,
          employee_date_step5_sp: today,
        },
        i9: {
          "Last Name (Family Name)": "Prueba",
          "First Name Given Name": "Juan",
          "Address Street Number and Name": "123 Calle Test",
          "City or Town": "Detroit",
          State: "MI",
          "ZIP Code": "48201",
          "Date of Birth mmddyyyy": "01/01/1990",
          "US Social Security Number": "111-11-1111",
          "Employees E-mail Address": "juan.prueba@example.com",
          "Telephone Number": "555-000-0101",
          CB_1: true,
          "Signature of Employee": signature,
          "Today's Date mmddyyy": today,
        },
        wh151: {
          WorkerSignature: signature,
          Text440: "Juan Prueba",
          Text441: today,
        },
      },
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
    applicantName: { firstName: "John", lastName: "Doe" },
    formValues: {
      employment: {
        date_of_application: today,
        last_name: "Doe",
        first_name: "John",
        middle_initial: "Q",
        phone_number: "555-123-4567",
        ssn: "123-45-6789",
        address: "123 Main Street",
        city: "Detroit",
        state: "MI",
        zip_code: "48201",
        email_address: "john.doe@example.com",
        age_18_yes: true,
        position_full_time: true,
        shift_day: true,
        travel_yes: true,
        overtime_yes: true,
        authorized_yes: true,
        emergency_1_full_name: "Jane Doe",
        emergency_1_relationship: "Spouse",
        emergency_1_phone: "555-987-6543",
        emergency_1_alt_phone: "555-111-2222",
        emergency_2_full_name: "Jim Doe",
        emergency_2_relationship: "Brother",
        emergency_2_phone: "555-333-4444",
        emergency_2_alt_phone: "555-555-6666",
        applicant_signature: signature,
        applicant_signature_date: today,
      },
      w4: {
        "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]": "John",
        "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]": "Doe",
        "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]": "123 Main Street",
        "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]": "Detroit, MI 48201",
        "topmostSubform[0].Page1[0].f1_05[0]": "123-45-6789",
        "topmostSubform[0].Page1[0].c1_1[0]": true,
        "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]": "0",
        "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_07[0]": "0",
        "topmostSubform[0].Page1[0].f1_08[0]": "0",
        employee_signature_step5: signature,
        employee_date_step5: today,
      },
      i9: {
        "Last Name (Family Name)": "Doe",
        "First Name Given Name": "John",
        "Address Street Number and Name": "123 Main Street",
        "City or Town": "Detroit",
        State: "MI",
        "ZIP Code": "48201",
        "Date of Birth mmddyyyy": "01/15/1990",
        "US Social Security Number": "123-45-6789",
        "Employees E-mail Address": "john.doe@example.com",
        "Telephone Number": "555-123-4567",
        CB_1: true,
        "Signature of Employee": signature,
        "Today's Date mmddyyy": today,
      },
      wh151: {
        WorkerSignature: signature,
        Text440: "John Doe",
        Text441: today,
      },
    },
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
