import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

/** Minimal field metadata needed to stamp a drawn signature onto a PDF page. */
export type PdfStampField = {
  name: string;
  /** 1-based page number (matches react-acroform FormField.page). */
  page: number;
  rect: [number, number, number, number];
};

const WIDGET_SUBTYPE = "Widget";

export async function extractPdfStampFields(
  pdfBytes: ArrayBuffer | Uint8Array
): Promise<PdfStampField[]> {
  if (typeof window !== "undefined" && !GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const data = pdfBytes instanceof ArrayBuffer ? new Uint8Array(pdfBytes) : pdfBytes;
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const fields: PdfStampField[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const annotations = await page.getAnnotations();

    for (const annotation of annotations) {
      if (annotation.subtype !== WIDGET_SUBTYPE) continue;
      if (!annotation.fieldName || !annotation.rect) continue;

      fields.push({
        name: annotation.fieldName,
        page: pageNum,
        rect: annotation.rect as [number, number, number, number],
      });
    }
  }

  return fields;
}
