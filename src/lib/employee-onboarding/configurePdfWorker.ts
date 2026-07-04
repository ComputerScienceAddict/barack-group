import { GlobalWorkerOptions as mainPdfWorkerOptions } from "pdfjs-dist";
import { GlobalWorkerOptions as legacyPdfWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

export const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

/** Configure pdf.js worker for both the main and legacy bundles used in onboarding. */
export function configurePdfWorker(workerSrc: string = PDF_WORKER_SRC) {
  if (typeof window === "undefined") return;

  mainPdfWorkerOptions.workerSrc = workerSrc;
  legacyPdfWorkerOptions.workerSrc = workerSrc;
}

configurePdfWorker();
