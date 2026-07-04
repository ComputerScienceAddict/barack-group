"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { pdfRectToScreen, useFormStateContext, type FormField } from "react-acroform";
import SignaturePad from "@/components/employee-onboarding/SignaturePad";
import {
  decodeDrawnSignature,
  encodeDrawnSignature,
  expandSignatureFieldRect,
} from "@/lib/employee-onboarding/signatureFields";

type AcroSignatureFieldProps = {
  field: FormField;
  scale: number;
  pageHeight: number;
  className?: string;
};

export default function AcroSignatureField({
  field,
  scale,
  pageHeight,
  className,
}: AcroSignatureFieldProps) {
  const formState = useFormStateContext();
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState("");
  const [padSession, setPadSession] = useState(0);

  const currentValue = String(formState.getValue(field.name) ?? "");
  const signatureImage = useMemo(() => decodeDrawnSignature(currentValue), [currentValue]);

  function openSigner() {
    setOpen(true);
    setDraftValue(signatureImage ?? "");
    setPadSession((value) => value + 1);
  }

  function closeSigner() {
    setOpen(false);
  }

  function saveSignature() {
    if (!draftValue) return;
    formState.setValue(field.name, encodeDrawnSignature(draftValue));
    setOpen(false);
  }

  function clearSignature() {
    formState.setValue(field.name, "");
    setDraftValue("");
    setPadSession((value) => value + 1);
  }

  const displayField = useMemo(
    () => ({
      ...field,
      rect: expandSignatureFieldRect(field.name, field.rect),
    }),
    [field]
  );

  const { height: fieldHeight } = pdfRectToScreen(displayField.rect, pageHeight, scale);
  const buttonMinHeight = Math.max(40, fieldHeight);

  const positionStyle = useMemo((): CSSProperties => {
    const { left, top, width, height } = pdfRectToScreen(displayField.rect, pageHeight, scale);
    return {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${Math.max(height, buttonMinHeight)}px`,
    };
  }, [buttonMinHeight, displayField.rect, pageHeight, scale]);

  return (
    <>
      <div
        className={`react-acroform-field react-acroform-field--${field.type}${field.required ? " react-acroform-field--required" : ""}${field.readOnly ? " react-acroform-field--readonly" : ""}${className ? ` ${className}` : ""}`}
        style={positionStyle}
        data-field-name={field.name}
        data-field-type={field.type}
      >
        <div className="acroSignatureField" style={{ minHeight: buttonMinHeight }}>
          <button
            type="button"
            className={`acroSignatureButton${signatureImage ? " acroSignatureButtonFilled" : ""}`}
            style={{ minHeight: buttonMinHeight }}
            onClick={openSigner}
            aria-label={`Sign ${field.name}`}
          >
            {signatureImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={signatureImage} alt="Signature preview" className="acroSignaturePreview" />
            ) : (
              <span className="acroSignaturePrompt">Click to sign</span>
            )}
          </button>
          {signatureImage && (
            <button
              type="button"
              className="acroSignatureClear"
              onClick={clearSignature}
              aria-label={`Clear ${field.name}`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="signatureModal" role="dialog" aria-modal="true" aria-label={`Sign ${field.name}`}>
          <div className="signatureModalCard">
            <p className="signatureModalTitle">Draw your signature</p>
            <SignaturePad key={padSession} onChange={setDraftValue} />
            <div className="signatureModalActions">
              <button type="button" className="secondaryButton" onClick={closeSigner}>
                Cancel
              </button>
              <button type="button" className="primaryButton" onClick={saveSignature} disabled={!draftValue}>
                Use signature
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
