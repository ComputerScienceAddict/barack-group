"use client";

import { FormEvent, useMemo, useState } from "react";
import SignaturePad from "@/components/onboarding/signature-pad";
import { mockDocumentSections, onboardingChecklist } from "@/lib/mock-documents";
import "./onboarding.css";

type FormState = {
  legalName: string;
  preferredName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  startDate: string;
  emergencyContact: string;
  federalStatus: string;
  stateWithholding: string;
  routingNumber: string;
  accountNumber: string;
  handbook: boolean;
  confidentiality: boolean;
  devicePolicy: boolean;
  typedSignature: string;
  signatureDataUrl: string;
};

const initialState: FormState = {
  legalName: "",
  preferredName: "",
  email: "",
  phone: "",
  role: "Cleaning Technician",
  department: "Field Operations",
  startDate: "",
  emergencyContact: "",
  federalStatus: "Single",
  stateWithholding: "0",
  routingNumber: "",
  accountNumber: "",
  handbook: false,
  confidentiality: false,
  devicePolicy: false,
  typedSignature: "",
  signatureDataUrl: "",
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function OnboardingApp() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<string>("");
  const [activeStep, setActiveStep] = useState("profile");

  const completed = useMemo(() => {
    return {
      profile: Boolean(form.legalName && form.email && form.role && form.startDate),
      tax: Boolean(form.federalStatus && form.stateWithholding),
      bank: Boolean(form.routingNumber && form.accountNumber),
      policy: form.handbook && form.confidentiality && form.devicePolicy,
      signature: Boolean(form.signatureDataUrl || form.typedSignature),
    };
  }, [form]);

  const completionCount = Object.values(completed).filter(Boolean).length;
  const completionPercent = Math.round((completionCount / onboardingChecklist.length) * 100);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setConfirmation("");
  }

  function validateForm() {
    const nextErrors: string[] = [];
    if (!completed.profile) nextErrors.push("Finish the new hire profile section.");
    if (!completed.tax) nextErrors.push("Complete the mock tax withholding section.");
    if (!completed.bank) nextErrors.push("Add mock direct deposit details.");
    if (!completed.policy) nextErrors.push("Acknowledge all company policies.");
    if (!completed.signature) nextErrors.push("Draw or type a signature in the mock document.");
    return nextErrors;
  }

  function submitPacket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (nextErrors.length > 0) return;

    const packetId = `NH-${Date.now().toString().slice(-6)}`;
    setConfirmation(packetId);
    window.localStorage.setItem(
      "newHireOnboardingPacket",
      JSON.stringify({ packetId, submittedAt: new Date().toISOString(), form }, null, 2)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function downloadPacket() {
    const payload = JSON.stringify(
      {
        packetType: "Mock new hire onboarding packet",
        generatedAt: new Date().toISOString(),
        form: {
          ...form,
          signatureDataUrl: form.signatureDataUrl ? "signature image captured" : "no drawn signature",
        },
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mock-new-hire-packet.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="onboarding-portal pageShell">
      <section className="heroCard">
        <div>
          <p className="eyebrow">Barak Group Inc.</p>
          <h1>New Hire Onboarding</h1>
          <p className="heroText">
            Complete your profile, mock payroll forms, policy acknowledgements, and electronic
            signature in one workflow. This is a test portal — do not enter real SSNs or banking
            details.
          </p>
        </div>
        <div className="progressCard" aria-label="Onboarding completion">
          <span>{completionPercent}% complete</span>
          <div className="progressTrack">
            <div className="progressFill" style={{ width: `${completionPercent}%` }} />
          </div>
          <p>
            {completionCount} of {onboardingChecklist.length} sections ready
          </p>
        </div>
      </section>

      {confirmation && (
        <section className="successBanner" role="status">
          <strong>Packet submitted.</strong> Test confirmation ID: {confirmation}. A mock copy was
          saved to browser local storage.
        </section>
      )}

      {errors.length > 0 && (
        <section className="errorBanner" role="alert">
          <strong>Finish these before submitting:</strong>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="workspaceGrid">
        <aside className="sidebarCard" aria-label="Onboarding checklist">
          <h2>Required paperwork</h2>
          <div className="stepList">
            {onboardingChecklist.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`stepButton ${activeStep === item.id ? "activeStep" : ""}`}
                onClick={() => setActiveStep(item.id)}
              >
                <span
                  className={
                    completed[item.id as keyof typeof completed] ? "stepStatus done" : "stepStatus"
                  }
                >
                  {completed[item.id as keyof typeof completed] ? "✓" : ""}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.helper}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <form className="formCard" onSubmit={submitPacket}>
          <section className="formSection" id="profile">
            <div className="sectionHeader">
              <p className="eyebrow">Step 1</p>
              <h2>New hire profile</h2>
            </div>
            <div className="fieldGrid twoColumns">
              <label>
                Legal name
                <input
                  value={form.legalName}
                  onChange={(event) => updateField("legalName", event.target.value)}
                  placeholder="Jane A. Employee"
                />
              </label>
              <label>
                Preferred name
                <input
                  value={form.preferredName}
                  onChange={(event) => updateField("preferredName", event.target.value)}
                  placeholder="Jane"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="jane@company.com"
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="(555) 123-4567"
                />
              </label>
              <label>
                Role
                <input value={form.role} onChange={(event) => updateField("role", event.target.value)} />
              </label>
              <label>
                Department
                <select
                  value={form.department}
                  onChange={(event) => updateField("department", event.target.value)}
                >
                  <option>Field Operations</option>
                  <option>Commercial Cleaning</option>
                  <option>Residential Cleaning</option>
                  <option>Administration</option>
                  <option>Human Resources</option>
                </select>
              </label>
              <label>
                Start date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                />
              </label>
              <label>
                Emergency contact
                <input
                  value={form.emergencyContact}
                  onChange={(event) => updateField("emergencyContact", event.target.value)}
                  placeholder="Name and phone"
                />
              </label>
            </div>
          </section>

          <section className="formSection" id="tax">
            <div className="sectionHeader">
              <p className="eyebrow">Step 2</p>
              <h2>Mock tax withholding</h2>
            </div>
            <div className="noticeBox">
              Testing only. Do not collect real SSNs, real tax forms, or sensitive identity
              documents in this mock app.
            </div>
            <div className="fieldGrid twoColumns">
              <label>
                Federal filing status
                <select
                  value={form.federalStatus}
                  onChange={(event) => updateField("federalStatus", event.target.value)}
                >
                  <option>Single</option>
                  <option>Married filing jointly</option>
                  <option>Head of household</option>
                </select>
              </label>
              <label>
                Additional state withholding
                <input
                  value={form.stateWithholding}
                  onChange={(event) => updateField("stateWithholding", event.target.value)}
                  placeholder="0"
                />
              </label>
            </div>
          </section>

          <section className="formSection" id="bank">
            <div className="sectionHeader">
              <p className="eyebrow">Step 3</p>
              <h2>Mock direct deposit</h2>
            </div>
            <div className="fieldGrid twoColumns">
              <label>
                Routing number
                <input
                  inputMode="numeric"
                  value={form.routingNumber}
                  onChange={(event) => updateField("routingNumber", event.target.value)}
                  placeholder="123456789"
                />
              </label>
              <label>
                Account number
                <input
                  inputMode="numeric"
                  value={form.accountNumber}
                  onChange={(event) => updateField("accountNumber", event.target.value)}
                  placeholder="987654321"
                />
              </label>
            </div>
          </section>

          <section className="formSection" id="policy">
            <div className="sectionHeader">
              <p className="eyebrow">Step 4</p>
              <h2>Policy acknowledgements</h2>
            </div>
            <div className="checkboxStack">
              <label>
                <input
                  type="checkbox"
                  checked={form.handbook}
                  onChange={(event) => updateField("handbook", event.target.checked)}
                />
                I received and reviewed the employee handbook.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.confidentiality}
                  onChange={(event) => updateField("confidentiality", event.target.checked)}
                />
                I agree to the confidentiality and acceptable use policy.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.devicePolicy}
                  onChange={(event) => updateField("devicePolicy", event.target.checked)}
                />
                I understand company device, security, and safety requirements.
              </label>
            </div>
          </section>

          <section className="documentCard" id="signature">
            <div className="documentHeader">
              <div>
                <p className="eyebrow">Mock document</p>
                <h2>New Hire Paperwork Acknowledgement</h2>
              </div>
              <span className="documentBadge">Test document</span>
            </div>

            <div className="documentBody">
              {mockDocumentSections.map((section) => (
                <article key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </article>
              ))}

              <div className="signatureBlock">
                <div className="signHereLabel">Sign here</div>
                <SignaturePad onChange={(dataUrl) => updateField("signatureDataUrl", dataUrl)} />
                <div className="fieldGrid twoColumns">
                  <label>
                    Typed signature backup
                    <input
                      value={form.typedSignature}
                      onChange={(event) => updateField("typedSignature", event.target.value)}
                      placeholder="Jane A. Employee"
                    />
                  </label>
                  <label>
                    Signature date
                    <input value={todayIsoDate()} readOnly />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <div className="actionRow">
            <button type="button" className="ghostButton" onClick={downloadPacket}>
              Export test JSON
            </button>
            <button type="submit" className="primaryButton">
              Submit onboarding packet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
