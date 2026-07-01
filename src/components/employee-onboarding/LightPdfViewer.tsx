"use client";

import { useEffect, useRef, useState } from "react";
import { usePDFDocument } from "react-acroform";
import type { PDFPageProxy } from "pdfjs-dist";
import LightPdfPage from "@/components/employee-onboarding/LightPdfPage";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type LightPdfViewerProps = {
  src: string;
  workerSrc?: string;
  active?: boolean;
};

export default function LightPdfViewer({
  src,
  workerSrc = "/pdf.worker.min.mjs",
  active = true
}: LightPdfViewerProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const { document, loading, error } = usePDFDocument({ src, workerSrc });

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
    const container = containerRef.current;
    if (!container || pages.length === 0) return;

    const updateScale = () => {
      if (!active) return;
      const availableWidth = container.clientWidth - 24;
      if (availableWidth <= 0) return;
      const pageWidth = pages[0].getViewport({ scale: 1 }).width;
      setScale(clamp(availableWidth / pageWidth, 0.45, 2.5));
    };

    updateScale();
    const resizeObserver = new ResizeObserver(() => updateScale());
    resizeObserver.observe(container);
    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [active, pages]);

  if (loading) {
    return <p className="pdfFormHint">{t("loadingPdf")}</p>;
  }

  if (error) {
    return <p className="pdfFormError">{t("loadPdfFailed", { message: error.message })}</p>;
  }

  return (
    <div ref={containerRef} className="lightPdfViewer">
      {pages.map((page, index) => (
        <div key={`light-page-${index + 1}`} className="pdfPageWrap">
          <p className="pdfPageLabel">{t("pageOf", { current: index + 1, total: pages.length })}</p>
          <LightPdfPage page={page} scale={scale} />
        </div>
      ))}
    </div>
  );
}
