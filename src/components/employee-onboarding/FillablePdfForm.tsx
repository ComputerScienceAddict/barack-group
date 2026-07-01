"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject
} from "react";
import {
  FormStateProvider,
  type FormFieldValue,
  useFormFields,
  useFormStateContext,
  usePDFDocument
} from "react-acroform";
import type { PDFPageProxy } from "pdfjs-dist";
import "react-acroform/styles.css";
import AcroPdfPage from "@/components/employee-onboarding/AcroPdfPage";
import { downloadOnboardingPacket as downloadMergedPacket, downloadPdfBytes, fillPdf, type PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";
import { collectDomFieldValues, countNonEmptyFieldValues, mergePdfFieldValues, valueFromFieldEvent } from "@/lib/employee-onboarding/pdfFieldValues";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import type { MessageKey } from "@/lib/employee-onboarding/i18n";
import type { PdfFormConfig } from "@/lib/employee-onboarding/pdfForms";
import { ONBOARDING_PACKET_FILENAME } from "@/lib/employee-onboarding/pdfForms";
import { buildDirectDepositPdfBytes, usesDirectDeposit, type DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import { applyRequiredFieldHighlight, clearMissingPdfFieldMarks, markMissingPdfFields, scrollToPdfField } from "@/lib/employee-onboarding/requiredFields";

const FORM_TITLE_KEYS: Record<string, MessageKey> = {
  employment: "formEmployment",
  w4: "formW4",
  i9: "formI9",
  wh151: "formWh151"
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type FillablePdfFormProps = {
  config: PdfFormConfig;
  values: Record<string, PdfFieldValue>;
  defaultValues?: Record<string, PdfFieldValue>;
  onChange: (values: Record<string, PdfFieldValue>) => void;
  showDownload?: boolean;
  onDownloadComplete?: (summary: { filledCount: number; verifiedCount: number }) => void;
  active?: boolean;
};

export type FillablePdfFormHandle = {
  flushValues: () => Record<string, PdfFieldValue>;
  focusMissingFields: (fieldKeys: string[]) => boolean;
  clearMissingMarks: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function FormValuesBridge({
  valuesRef,
  fieldsRootRef,
  valuesStoreRef
}: {
  valuesRef: MutableRefObject<(() => Record<string, PdfFieldValue>) | null>;
  fieldsRootRef: RefObject<HTMLElement | null>;
  valuesStoreRef: MutableRefObject<Record<string, PdfFieldValue>>;
}) {
  const formState = useFormStateContext();

  useEffect(() => {
    valuesRef.current = () => {
      const root = fieldsRootRef.current;
      const domValues = root ? collectDomFieldValues(root) : {};
      return mergePdfFieldValues(
        mergePdfFieldValues(formState.getAllValues() as Record<string, PdfFieldValue>, valuesStoreRef.current),
        domValues
      );
    };
  }, [fieldsRootRef, formState, valuesRef, valuesStoreRef]);

  return null;
}

/** Keeps valuesStoreRef in sync with DOM edits without notifying the parent (avoids update loops). */
function DomSyncBridge({
  fieldsRootRef,
  valuesStoreRef
}: {
  fieldsRootRef: RefObject<HTMLElement | null>;
  valuesStoreRef: MutableRefObject<Record<string, PdfFieldValue>>;
}) {
  useEffect(() => {
    const root = fieldsRootRef.current;
    if (!root) return;

    const sync = (event: Event) => {
      const rootEl = fieldsRootRef.current;
      if (!rootEl) return;

      const domValues = collectDomFieldValues(rootEl);
      const eventValue = valueFromFieldEvent(event);
      if (eventValue) {
        domValues[eventValue.name] = eventValue.value;
      }

      valuesStoreRef.current = mergePdfFieldValues(valuesStoreRef.current, domValues);
    };

    root.addEventListener("input", sync, true);
    root.addEventListener("change", sync, true);

    return () => {
      root.removeEventListener("input", sync, true);
      root.removeEventListener("change", sync, true);
    };
  }, [fieldsRootRef, valuesStoreRef]);

  return null;
}

function ScrollablePdfPages({
  src,
  workerSrc,
  pageCount,
  fieldsRootRef,
  highlightFields,
  active = true
}: {
  src: string;
  workerSrc: string;
  pageCount: number;
  fieldsRootRef: RefObject<HTMLDivElement | null>;
  highlightFields: readonly string[];
  active?: boolean;
}) {
  const { t } = useLanguage();
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);

  const { document, loading, error } = usePDFDocument({ src, workerSrc });
  const { fields, loading: fieldsLoading, error: fieldsError, radioGroups } = useFormFields({ document });

  useEffect(() => {
    if (!document) {
      setPages([]);
      return;
    }

    let cancelled = false;
    Promise.all(Array.from({ length: document.numPages }, (_, index) => document.getPage(index + 1)))
      .then((loadedPages) => {
        if (!cancelled) setPages(loadedPages);
      })
      .catch((loadError) => console.error("Failed to load PDF pages:", loadError));

    return () => {
      cancelled = true;
    };
  }, [document]);

  useEffect(() => {
    const root = fieldsRootRef.current;
    if (!root || pages.length === 0) return;

    const tuneFields = () => {
      applyRequiredFieldHighlight(root, highlightFields);

      root.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(
        ".react-acroform-field textarea, .react-acroform-field input:not([type='checkbox']):not([type='radio'])"
      ).forEach((el) => {
        el.setAttribute("data-gramm", "false");
        el.setAttribute("data-gramm_editor", "false");
        el.setAttribute("data-enable-grammarly", "false");
        if (el instanceof HTMLTextAreaElement) {
          el.rows = 1;
        }
      });
    };

    tuneFields();
    const observer = new MutationObserver(tuneFields);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [fieldsRootRef, highlightFields, pages, fields]);

  useEffect(() => {
    const container = fieldsRootRef.current;
    if (!container || pages.length === 0) return;

    const updateScale = () => {
      if (!active) return;
      const availableWidth = container.clientWidth - 24;
      if (availableWidth <= 0) return;
      const pageWidth = pages[0].getViewport({ scale: 1 }).width;
      setScale(clamp(availableWidth / pageWidth, 0.5, 2.5));
    };

    updateScale();
    const resizeObserver = new ResizeObserver(() => updateScale());
    resizeObserver.observe(container);
    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [active, fieldsRootRef, pages]);

  if (loading) {
    return <p className="pdfFormHint">{t("loadingPdf")}</p>;
  }

  if (error) {
    return <p className="pdfFormError">{t("loadPdfFailed", { message: error.message })}</p>;
  }

  return (
    <div ref={fieldsRootRef} className="scrollablePdfViewer react-acroform-viewer">
      <p className="pdfFormHint pdfScrollNote">
        {t("scrollNote", { count: pageCount })}
      </p>
      {fieldsLoading && <p className="pdfFormHint">{t("preparingFields")}</p>}
      {fieldsError && (
        <p className="pdfFormError">{t("fieldsLoadFailed", { message: fieldsError.message })}</p>
      )}
      {pages.map((page, index) => (
        <div key={`page-wrap-${index + 1}`} className="pdfPageWrap">
          <p className="pdfPageLabel">{t("pageOf", { current: index + 1, total: pages.length })}</p>
          <AcroPdfPage
            page={page}
            pageNumber={index + 1}
            scale={scale}
            fields={fields}
            radioGroups={radioGroups}
          />
        </div>
      ))}
    </div>
  );
}

const FillablePdfForm = forwardRef<FillablePdfFormHandle, FillablePdfFormProps>(function FillablePdfForm(
  { config, values, defaultValues, onChange, showDownload = true, onDownloadComplete, active = true },
  ref
) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [downloadNote, setDownloadNote] = useState("");
  const formTitle = FORM_TITLE_KEYS[config.id] ? t(FORM_TITLE_KEYS[config.id]) : config.title;
  const latestValuesRef = useRef<(() => Record<string, PdfFieldValue>) | null>(null);
  const valuesStoreRef = useRef<Record<string, PdfFieldValue>>({});
  const onChangeRef = useRef(onChange);
  const fieldsRootRef = useRef<HTMLDivElement>(null);
  const mergedDefaults = useMemo(
    () => ({ ...defaultValues, ...values }),
    [defaultValues, values]
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valuesStoreRef.current = mergePdfFieldValues(valuesStoreRef.current, values);
  }, [values]);

  const readMergedValues = useCallback((): Record<string, PdfFieldValue> => {
    const root = fieldsRootRef.current;
    const domValues = root ? collectDomFieldValues(root) : {};
    const merged = mergePdfFieldValues(
      mergePdfFieldValues(mergePdfFieldValues(valuesStoreRef.current, values), latestValuesRef.current?.() ?? {}),
      domValues
    );
    valuesStoreRef.current = merged;
    return merged;
  }, [values]);

  const handleChange = useCallback(
    (_fieldName: string, _value: FormFieldValue, allValues: Record<string, FormFieldValue>) => {
      const root = fieldsRootRef.current;
      const domValues = root ? collectDomFieldValues(root) : {};
      const merged = mergePdfFieldValues(allValues as Record<string, PdfFieldValue>, domValues);
      valuesStoreRef.current = merged;
      onChangeRef.current(merged);
    },
    []
  );

  useImperativeHandle(
    ref,
    () => ({
      flushValues: () => {
        const merged = readMergedValues();
        onChangeRef.current(merged);
        return merged;
      },
      focusMissingFields: (fieldKeys: string[]) => {
        const root = fieldsRootRef.current;
        if (!root || fieldKeys.length === 0) return false;
        markMissingPdfFields(root, fieldKeys);
        return scrollToPdfField(root, fieldKeys[0]);
      },
      clearMissingMarks: () => {
        const root = fieldsRootRef.current;
        if (root) clearMissingPdfFieldMarks(root);
      }
    }),
    [readMergedValues]
  );

  async function handleDownload() {
    setDownloading(true);
    setDownloadError("");
    setDownloadNote("");
    try {
      const latestValues = readMergedValues();
      onChangeRef.current(latestValues);
      const result = await fillPdf(config.templatePath, latestValues);
      if (countNonEmptyFieldValues(latestValues) > 0 && result.filledCount === 0) {
        throw new Error(t("downloadFailed"));
      }
      downloadPdfBytes(result.pdfBytes, config.downloadFilename);
      const note =
        result.filledCount > 0
          ? t("downloadSaved", { count: result.filledCount, verified: result.verifiedCount })
          : t("downloadBlank", { title: formTitle });
      setDownloadNote(note);
      onDownloadComplete?.({ filledCount: result.filledCount, verifiedCount: result.verifiedCount });
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="pdfFormSection">
      <div className="pdfFormToolbar">
        <p className="pdfFormHint">{t("requiredLegend")} · {t("scrollHint")}</p>
        {showDownload && (
          <button type="button" className="secondaryButton" onClick={handleDownload} disabled={downloading}>
            {downloading ? t("downloadPreparing") : t("downloadFilled", { title: formTitle })}
          </button>
        )}
      </div>
      {downloadError && <p className="pdfFormError">{downloadError}</p>}
      {downloadNote && <p className="pdfFormSuccess">{downloadNote}</p>}
      <div className="pdfViewerShell">
        <FormStateProvider values={mergedDefaults} onChange={handleChange}>
          <FormValuesBridge
            valuesRef={latestValuesRef}
            fieldsRootRef={fieldsRootRef}
            valuesStoreRef={valuesStoreRef}
          />
          <DomSyncBridge fieldsRootRef={fieldsRootRef} valuesStoreRef={valuesStoreRef} />
          <ScrollablePdfPages
            src={config.templatePath}
            workerSrc="/pdf.worker.min.mjs"
            pageCount={config.pageCount}
            fieldsRootRef={fieldsRootRef}
            highlightFields={config.requiredRules.highlightFields}
            active={active}
          />
        </FormStateProvider>
      </div>
    </div>
  );
});

export default FillablePdfForm;

export async function downloadPdfForm(config: PdfFormConfig, values: Record<string, PdfFieldValue>) {
  const result = await fillPdf(config.templatePath, values);
  if (countNonEmptyFieldValues(values) > 0 && result.filledCount === 0) {
    throw new Error(`Could not save field values into ${config.title}.`);
  }
  downloadPdfBytes(result.pdfBytes, config.downloadFilename);
  return result;
}

export async function downloadPdfForms(
  entries: Array<{ config: PdfFormConfig; values: Record<string, PdfFieldValue> }>
) {
  const results = [];
  for (const entry of entries) {
    const result = await downloadPdfForm(entry.config, entry.values);
    results.push(result);
    await delay(350);
  }
  return results;
}

export async function downloadOnboardingPacket(
  entries: Array<{ config: PdfFormConfig; values: Record<string, PdfFieldValue> }>,
  directDeposit?: DirectDepositValues
) {
  const appendPdfBytes =
    directDeposit && usesDirectDeposit(directDeposit)
      ? [await buildDirectDepositPdfBytes(directDeposit)]
      : undefined;
  return downloadMergedPacket(
    entries.map((entry) => ({ templatePath: entry.config.templatePath, values: entry.values })),
    ONBOARDING_PACKET_FILENAME,
    { appendPdfBytes }
  );
}
