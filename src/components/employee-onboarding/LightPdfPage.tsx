"use client";

import { useEffect, useRef, useState } from "react";
import { AnnotationMode } from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist";

type LightPdfPageProps = {
  page: PDFPageProxy;
  scale: number;
};

/** Renders a PDF page on a white canvas (no dark browser PDF plugin, no form ghosts). */
export default function LightPdfPage({ page, scale }: LightPdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageViewport.width, pageViewport.height);

        if (cancelled) return;

        const renderTask = page.render({
          canvasContext: context,
          viewport: pageViewport,
          annotationMode: AnnotationMode.DISABLE
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (!cancelled) setRendering(false);
      } catch (err) {
        if ((err as { name?: string })?.name === "RenderingCancelledException" || cancelled) return;
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

  if (error) {
    return <p className="pdfFormError">Failed to render page: {error.message}</p>;
  }

  return (
    <div className="lightPdfPage">
      <canvas ref={canvasRef} className="lightPdfCanvas" />
      {rendering && <p className="pdfFormHint lightPdfLoading">Loading page...</p>}
    </div>
  );
}
