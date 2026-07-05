"use client";

import "@/lib/employee-onboarding/configurePdfWorker";
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
import { PDF_WORKER_SRC } from "@/lib/employee-onboarding/configurePdfWorker";
import type { PDFPageProxy } from "pdfjs-dist";
import "react-acroform/styles.css";
import AcroPdfPage from "@/components/employee-onboarding/AcroPdfPage";
import { downloadOnboardingPacket as downloadMergedPacket, downloadPdfBytes, fillPdf, type PdfFieldValue, type PdfStampField } from "@/lib/employee-onboarding/fillPdf";
import { collectDomFieldValues, countNonEmptyFieldValues, mergePdfFieldValues, valueFromFieldEvent } from "@/lib/employee-onboarding/pdfFieldValues";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import type { MessageKey } from "@/lib/employee-onboarding/i18n";
import type { PdfFormConfig } from "@/lib/employee-onboarding/pdfForms";
import { ONBOARDING_PACKET_FILENAME } from "@/lib/employee-onboarding/pdfForms";
import { buildDirectDepositPdfBytes, usesDirectDeposit, type DirectDepositValues } from "@/lib/employee-onboarding/directDeposit";
import { applyRequiredFieldHighlight, clearMissingPdfFieldMarks, markMissingPdfFields, scrollToPdfField } from "@/lib/employee-onboarding/requiredFields";
import {
  assignWh153OverlayKeys,
  collapseWh153FormValues,
  expandWh153FormValues,
  mapWh153PdfKeysToOverlay,
  resolveWh153ScrollTarget,
  type Wh153OverlayMapping,
} from "@/lib/employee-onboarding/wh153FieldOverlay";

const FORM_TITLE_KEYS: Record<string, MessageKey> = {
  employment: "formEmployment",
  w4: "formW4",
  i9: "formI9",
  wh151: "formWh151",
  wh153: "formWh153",
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
  getStampFields: () => PdfStampField[];
  focusMissingFields: (fieldKeys: string[]) => boolean;
  clearMissingMarks: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function FormValuesBridge({
  valuesRef,
  fieldsRootRef,
  valuesStoreRef,
  normalizeValues,
}: {
  valuesRef: MutableRefObject<(() => Record<string, PdfFieldValue>) | null>;
  fieldsRootRef: RefObject<HTMLElement | null>;
  valuesStoreRef: MutableRefObject<Record<string, PdfFieldValue>>;
  normalizeValues?: (values: Record<string, PdfFieldValue>) => Record<string, PdfFieldValue>;
}) {
  const formState = useFormStateContext();

  useEffect(() => {
    valuesRef.current = () => {
      const root = fieldsRootRef.current;
      const domValues = root ? collectDomFieldValues(root) : {};
      const merged = mergePdfFieldValues(
        mergePdfFieldValues(formState.getAllValues() as Record<string, PdfFieldValue>, valuesStoreRef.current),
        domValues
      );
      return normalizeValues ? normalizeValues(merged) : merged;
    };
  }, [fieldsRootRef, formState, normalizeValues, valuesRef, valuesStoreRef]);

  return null;
}

/** Keeps valuesStoreRef in sync with DOM edits without notifying the parent (avoids update loops). */
function DomSyncBridge({
  fieldsRootRef,
  valuesStoreRef,
  normalizeValues,
}: {
  fieldsRootRef: RefObject<HTMLElement | null>;
  valuesStoreRef: MutableRefObject<Record<string, PdfFieldValue>>;
  normalizeValues?: (values: Record<string, PdfFieldValue>) => Record<string, PdfFieldValue>;
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

      const merged = mergePdfFieldValues(valuesStoreRef.current, domValues);
      valuesStoreRef.current = normalizeValues ? normalizeValues(merged) : merged;
    };

    root.addEventListener("input", sync, true);
    root.addEventListener("change", sync, true);

    return () => {
      root.removeEventListener("input", sync, true);
      root.removeEventListener("change", sync, true);
    };
  }, [fieldsRootRef, normalizeValues, valuesStoreRef]);

  return null;
}

function ScrollablePdfPages({
  src,
  workerSrc,
  pageCount,
  fieldsRootRef,
  highlightFields,
  excludeHighlightFields,
  hiddenOverlayFields,
  highlightPages,
  emphasisFields,
  useWh153Overlay = false,
  onWh153Mapping,
  onStampFields,
  active = true
}: {
  src: string;
  workerSrc: string;
  pageCount: number;
  fieldsRootRef: RefObject<HTMLDivElement | null>;
  highlightFields: readonly string[];
  excludeHighlightFields?: readonly string[];
  hiddenOverlayFields?: readonly string[];
  highlightPages?: readonly number[];
  emphasisFields?: readonly string[];
  useWh153Overlay?: boolean;
  onWh153Mapping?: (mapping: Wh153OverlayMapping) => void;
  onStampFields?: (fields: PdfStampField[]) => void;
  active?: boolean;
}) {
  const { t } = useLanguage();
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);

  const { document, loading, error } = usePDFDocument({ src, workerSrc });
  const { fields, loading: fieldsLoading, error: fieldsError, radioGroups } = useFormFields({ document });

  const wh153Overlay = useMemo(() => {
    if (!useWh153Overlay || fields.length === 0) return null;
    return assignWh153OverlayKeys(fields);
  }, [fields, useWh153Overlay]);

  const displayFields = wh153Overlay?.fields ?? fields;

  const resolvedHighlightFields = useMemo(() => {
    if (!wh153Overlay) return highlightFields;
    return mapWh153PdfKeysToOverlay(wh153Overlay.mapping, highlightFields);
  }, [highlightFields, wh153Overlay]);

  const hiddenFieldNames = useMemo(
    () => (hiddenOverlayFields?.length ? new Set(hiddenOverlayFields) : undefined),
    [hiddenOverlayFields]
  );

  useEffect(() => {
    if (wh153Overlay) {
      onWh153Mapping?.(wh153Overlay.mapping);
    }
  }, [onWh153Mapping, wh153Overlay]);

  useEffect(() => {
    if (!onStampFields || displayFields.length === 0) return;
    onStampFields(
      displayFields.map((field) => ({
        name: field.name,
        page: field.page,
        rect: field.rect,
      }))
    );
  }, [displayFields, onStampFields]);

  useEffect(() => {
    if (!document) return;

    let cancelled = false;
    const pagesToRender = Math.max(1, Math.min(pageCount, document.numPages));
    Promise.all(Array.from({ length: pagesToRender }, (_, index) => document.getPage(index + 1)))
      .then((loadedPages) => {
        if (!cancelled) setPages(loadedPages);
      })
      .catch((loadError) => console.error("Failed to load PDF pages:", loadError));

    return () => {
      cancelled = true;
    };
  }, [document, pageCount]);

  const visiblePages = useMemo(() => (document ? pages : []), [document, pages]);

  useEffect(() => {
    const root = fieldsRootRef.current;
    if (!root || visiblePages.length === 0) return;

    const tuneFields = () => {
      applyRequiredFieldHighlight(
        root,
        resolvedHighlightFields,
        highlightPages,
        emphasisFields,
        excludeHighlightFields
      );

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
  }, [
    emphasisFields,
    excludeHighlightFields,
    fieldsRootRef,
    highlightPages,
    resolvedHighlightFields,
    visiblePages.length,
  ]);

  useEffect(() => {
    const container = fieldsRootRef.current;
    if (!container || visiblePages.length === 0) return;

    const updateScale = () => {
      if (!active) return;
      const availableWidth = container.clientWidth - 24;
      if (availableWidth <= 0) return;
      const pageWidth = visiblePages[0].getViewport({ scale: 1 }).width;
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
  }, [active, fieldsRootRef, visiblePages]);

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
      {visiblePages.map((page, index) => (
        <div key={`page-wrap-${index + 1}`} className="pdfPageWrap">
          <p className="pdfPageLabel">{t("pageOf", { current: index + 1, total: visiblePages.length })}</p>
          <AcroPdfPage
            page={page}
            pageNumber={index + 1}
            scale={scale}
            fields={displayFields}
            radioGroups={radioGroups}
            hiddenFieldNames={hiddenFieldNames}
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
  const stampFieldsRef = useRef<PdfStampField[]>([]);
  const isWh153 = config.id === "wh153";
  const wh153MappingRef = useRef<Wh153OverlayMapping | null>(null);
  const [wh153Mapping, setWh153Mapping] = useState<Wh153OverlayMapping | null>(null);
  const mergedDefaults = useMemo(() => {
    const base = { ...defaultValues, ...values };
    if (!isWh153 || !wh153Mapping) return base;
    return { ...base, ...expandWh153FormValues(wh153Mapping, base) };
  }, [defaultValues, isWh153, values, wh153Mapping]);

  const collapseOverlayValues = useCallback(
    (overlayValues: Record<string, PdfFieldValue>) => {
      if (!isWh153 || !wh153MappingRef.current) return overlayValues;
      return collapseWh153FormValues(wh153MappingRef.current, overlayValues);
    },
    [isWh153]
  );

  useEffect(() => {
    wh153MappingRef.current = wh153Mapping;
  }, [wh153Mapping]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valuesStoreRef.current = isWh153 ? values : mergePdfFieldValues(valuesStoreRef.current, values);
  }, [isWh153, values]);

  const readMergedValues = useCallback((): Record<string, PdfFieldValue> => {
    const root = fieldsRootRef.current;
    const domValues = root ? collectDomFieldValues(root) : {};
    const stateValues =
      latestValuesRef.current?.() ??
      (isWh153 && wh153Mapping ? expandWh153FormValues(wh153Mapping, values) : values);
    const merged = mergePdfFieldValues(stateValues, domValues);
    const normalized = collapseOverlayValues(merged);
    valuesStoreRef.current = normalized;
    return normalized;
  }, [collapseOverlayValues, isWh153, values, wh153Mapping]);

  const handleChange = useCallback(
    (_fieldName: string, _value: FormFieldValue, allValues: Record<string, FormFieldValue>) => {
      const root = fieldsRootRef.current;
      const domValues = root ? collectDomFieldValues(root) : {};
      const merged = collapseOverlayValues(
        mergePdfFieldValues(allValues as Record<string, PdfFieldValue>, domValues)
      );
      valuesStoreRef.current = merged;
      onChangeRef.current(merged);
    },
    [collapseOverlayValues]
  );

  useImperativeHandle(
    ref,
    () => ({
      flushValues: () => {
        const merged = readMergedValues();
        onChangeRef.current(merged);
        return merged;
      },
      getStampFields: () => stampFieldsRef.current,
      focusMissingFields: (fieldKeys: string[]) => {
        const root = fieldsRootRef.current;
        if (!root || fieldKeys.length === 0) return false;
        const resolvedKeys =
          isWh153 && wh153MappingRef.current
            ? fieldKeys.map((key) => resolveWh153ScrollTarget(wh153MappingRef.current!, key))
            : fieldKeys;
        markMissingPdfFields(root, resolvedKeys);
        return scrollToPdfField(root, resolvedKeys[0]);
      },
      clearMissingMarks: () => {
        const root = fieldsRootRef.current;
        if (root) clearMissingPdfFieldMarks(root);
      }
    }),
    [isWh153, readMergedValues]
  );

  async function handleDownload() {
    setDownloading(true);
    setDownloadError("");
    setDownloadNote("");
    try {
      const latestValues = readMergedValues();
      onChangeRef.current(latestValues);
      const result = await fillPdf(config.templatePath, latestValues, undefined, stampFieldsRef.current);
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
            normalizeValues={isWh153 ? collapseOverlayValues : undefined}
          />
          <DomSyncBridge
            fieldsRootRef={fieldsRootRef}
            valuesStoreRef={valuesStoreRef}
            normalizeValues={isWh153 ? collapseOverlayValues : undefined}
          />
          <ScrollablePdfPages
            src={config.templatePath}
            workerSrc={PDF_WORKER_SRC}
            pageCount={config.pageCount}
            fieldsRootRef={fieldsRootRef}
            highlightFields={config.requiredRules.highlightFields}
            excludeHighlightFields={config.requiredRules.excludeHighlightFields}
            hiddenOverlayFields={config.requiredRules.hiddenOverlayFields}
            highlightPages={config.requiredRules.highlightPages}
            emphasisFields={config.requiredRules.emphasisFields}
            useWh153Overlay={isWh153}
            onWh153Mapping={setWh153Mapping}
            onStampFields={(fields) => {
              stampFieldsRef.current = fields;
            }}
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
    entries.map((entry) => ({
      templatePath: entry.config.templatePath,
      values: entry.values,
      pageCount: entry.config.pageCount,
    })),
    ONBOARDING_PACKET_FILENAME,
    { appendPdfBytes }
  );
}
