"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckboxField,
  DropdownField,
  RadioField,
  SignatureField,
  type FormField
} from "react-acroform";
import AcroTextField from "@/components/employee-onboarding/AcroTextField";
import AcroSignatureField from "@/components/employee-onboarding/AcroSignatureField";
import { isPdfSignatureField } from "@/lib/employee-onboarding/signatureFields";
import { W4_LEGACY_STEP5_FIELDS } from "@/lib/employee-onboarding/w4Fields";
import { AnnotationMode } from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist";

type AcroPdfPageProps = {
  page: PDFPageProxy;
  pageNumber: number;
  scale: number;
  fields: FormField[];
  radioGroups: Map<string, FormField[]>;
  className?: string;
  onSignatureClick?: (field: FormField) => void;
  hiddenFieldNames?: ReadonlySet<string>;
};

/**
 * Like react-acroform PDFPage, but renders the canvas without built-in form
 * appearances so HTML overlays are not doubled with ghost PDF field text.
 */
export default function AcroPdfPage({
  page,
  pageNumber,
  scale,
  fields,
  radioGroups,
  className = "",
  onSignatureClick,
  hiddenFieldNames
}: AcroPdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pageHeight = page.getViewport({ scale: 1 }).height;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancelled render tasks.
        }
        renderTaskRef.current = null;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        setError(new Error("Could not get canvas context"));
        return;
      }

      setRendering(true);
      setError(null);

      try {
        const pageViewport = page.getViewport({ scale });
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = pageViewport.width * devicePixelRatio;
        canvas.height = pageViewport.height * devicePixelRatio;
        canvas.style.width = `${pageViewport.width}px`;
        canvas.style.height = `${pageViewport.height}px`;
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (cancelled) return;

        const renderTask = page.render({
          canvasContext: context,
          viewport: pageViewport,
          annotationMode: AnnotationMode.ENABLE
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (!cancelled) {
          setViewport({
            width: pageViewport.width,
            height: pageViewport.height
          });
          setRendering(false);
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "RenderingCancelledException" || cancelled) {
          return;
        }
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to render page"));
          setRendering(false);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancelled render tasks.
        }
        renderTaskRef.current = null;
      }
    };
  }, [page, scale]);

  const pageFields = useMemo(
    () =>
      fields.filter(
        (field) =>
          field.page === pageNumber &&
          !W4_LEGACY_STEP5_FIELDS.has(field.name) &&
          !(hiddenFieldNames?.has(field.name) ?? false)
      ),
    [fields, hiddenFieldNames, pageNumber]
  );

  if (error) {
    return (
      <div className={`react-acroform-page react-acroform-page--error ${className}`}>
        <p>Error rendering page: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      className={`react-acroform-page ${className}`}
      style={{
        position: "relative",
        display: "inline-block",
        margin: "10px auto",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        backgroundColor: "#fff"
      }}
      data-page-number={pageNumber}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {rendering && <div className="react-acroform-page__loading">Loading page...</div>}
      {viewport && (
        <div
          className="react-acroform-page__overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: viewport.width,
            height: viewport.height,
            pointerEvents: "none"
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            {pageFields.map((field) => {
              const commonProps = { field, scale, pageHeight };
              const key = `${field.name}-${field.rect.join("-")}`;

              switch (field.type) {
                case "text":
                  if (isPdfSignatureField(field.name)) {
                    return <AcroSignatureField key={key} {...commonProps} />;
                  }
                  return <AcroTextField key={key} {...commonProps} />;
                case "checkbox":
                  return <CheckboxField key={key} {...commonProps} />;
                case "radio":
                  return (
                    <RadioField
                      key={key}
                      {...commonProps}
                      groupFields={radioGroups.get(field.name) ?? [field]}
                    />
                  );
                case "dropdown":
                  return <DropdownField key={key} {...commonProps} />;
                case "signature":
                  return (
                    <SignatureField key={key} {...commonProps} onSignatureClick={onSignatureClick} />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}
