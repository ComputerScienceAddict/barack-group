"use client";

import { useMemo, useState } from "react";
import {
  buildSuppliesRequestBody,
  buildSuppliesRequestSubject,
} from "@/lib/supplies-request/formatSuppliesRequestEmail";
import { SUPPLIES_REQUEST_RECIPIENTS } from "@/lib/supplies-request/constants";

function createSupplyRow() {
  return { id: crypto.randomUUID(), value: "" };
}

export function SuppliesRequestForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rows, setRows] = useState([createSupplyRow()]);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  function updateRow(id: string, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, value } : row)));
    setMessage("");
  }

  function addRow() {
    setRows((current) => [...current, createSupplyRow()]);
  }

  function removeRow(id: string) {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  }

  function getCleanSupplies() {
    return rows.map((row) => row.value.trim()).filter(Boolean);
  }

  function validateForm() {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      setMessageIsError(true);
      return false;
    }

    if (!location.trim()) {
      setMessage("Please enter your location.");
      setMessageIsError(true);
      return false;
    }

    if (getCleanSupplies().length === 0) {
      setMessage("Add at least one supply before continuing.");
      setMessageIsError(true);
      return false;
    }

    return true;
  }

  function handleReview() {
    if (!validateForm()) return;
    setMessage("");
    setStep("confirm");
  }

  async function handleSubmit() {
    if (!validateForm()) {
      setStep("form");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/supplies-request/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          supplies: getCleanSupplies(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not send supplies request.");
      }

      setMessage("Request sent. Thanks!");
      setMessageIsError(false);
      setName("");
      setLocation("");
      setRows([createSupplyRow()]);
      setStep("form");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send supplies request.");
      setMessageIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const cleanSupplies = getCleanSupplies();
  const emailPreview = useMemo(() => {
    if (cleanSupplies.length === 0) return null;
    const payload = {
      name: name.trim(),
      location: location.trim(),
      supplies: cleanSupplies,
    };
    return {
      subject: buildSuppliesRequestSubject(payload),
      body: buildSuppliesRequestBody(payload),
      recipients: SUPPLIES_REQUEST_RECIPIENTS.join(", "),
    };
  }, [cleanSupplies, location, name]);

  return (
    <div className="supplies-request">
      {step === "form" ? (
        <>
          <div className="form-field">
            <label htmlFor="supplies-name">Your name</label>
            <input
              id="supplies-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="supplies-location">Location</label>
            <input
              id="supplies-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Site, building, or city"
            />
          </div>

          <div className="supplies-request-list">
            <p className="contact-label supplies-request-list-title">Supplies needed</p>

            {rows.map((row, index) => (
              <div key={row.id} className="supplies-request-row">
                <label htmlFor={`supply-${row.id}`} className="supplies-request-row-label">
                  Supply {index + 1}
                </label>
                <div className="supplies-request-row-input">
                  <input
                    id={`supply-${row.id}`}
                    type="text"
                    value={row.value}
                    onChange={(event) => updateRow(row.id, event.target.value)}
                    placeholder="e.g. Mop heads, gloves, trash bags"
                  />
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className="supplies-request-remove-btn"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Remove supply ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" className="btn-primary supplies-request-add-btn" onClick={addRow}>
              + Add another supply
            </button>
          </div>

          <button type="button" className="btn-primary supplies-request-submit-btn" onClick={handleReview}>
            Review and submit
          </button>
        </>
      ) : (
        <div className="supplies-request-confirm">
          <h2>Are you sure this is everything?</h2>
          <p>Double-check your list before we send it in.</p>

          <div className="supplies-request-email-preview">
            <p className="supplies-request-email-label">Email preview</p>
            <div className="supplies-request-email-card">
              <dl className="supplies-request-email-meta">
                <div>
                  <dt>To</dt>
                  <dd>{emailPreview?.recipients}</dd>
                </div>
                <div>
                  <dt>Subject</dt>
                  <dd>{emailPreview?.subject}</dd>
                </div>
              </dl>
              <pre className="supplies-request-email-body">{emailPreview?.body}</pre>
            </div>
          </div>

          <div className="supplies-request-actions">
            <button
              type="button"
              className="btn-secondary supplies-request-action-btn"
              onClick={() => setStep("form")}
              disabled={submitting}
            >
              Go back and edit
            </button>
            <button type="button" className="btn-primary supplies-request-action-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Sending..." : "Yes, send it"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={messageIsError ? "supplies-request-message supplies-request-message-error" : "supplies-request-message"}>
          {message}
        </p>
      )}
    </div>
  );
}
