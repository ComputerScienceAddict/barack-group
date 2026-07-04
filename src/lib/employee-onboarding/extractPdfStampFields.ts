import { PDFDocument } from "pdf-lib";

/** Minimal field metadata needed to stamp a drawn signature onto a PDF page. */
export type PdfStampField = {
  name: string;
  /** 1-based page number (matches react-acroform FormField.page). */
  page: number;
  rect: [number, number, number, number];
};

function findWidgetPageNumber(
  doc: PDFDocument,
  widget: { P: () => unknown; dict: unknown }
): number {
  const pages = doc.getPages();
  const pageRef = widget.P();

  let pageIndex = pages.findIndex((page) => page.ref === pageRef);
  if (pageIndex === -1) {
    const widgetRef = doc.context.getObjectRef(widget.dict as Parameters<typeof doc.context.getObjectRef>[0]);
    if (widgetRef) {
      const page = doc.findPageForAnnotationRef(widgetRef);
      if (page) {
        pageIndex = pages.findIndex((entry) => entry.ref === page.ref);
      }
    }
  }

  return pageIndex >= 0 ? pageIndex + 1 : 1;
}

/** Extract AcroForm widget metadata with pdf-lib (works on Vercel/serverless; no PDF.js worker). */
export async function extractPdfStampFields(
  pdfBytes: ArrayBuffer | Uint8Array
): Promise<PdfStampField[]> {
  const data = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
  const doc = await PDFDocument.load(data, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields: PdfStampField[] = [];

  for (const field of form.getFields()) {
    const name = field.getName();
    if (!name) continue;

    for (const widget of field.acroField.getWidgets()) {
      const { x, y, width, height } = widget.getRectangle();
      fields.push({
        name,
        page: findWidgetPageNumber(doc, widget),
        rect: [x, y, x + width, y + height],
      });
    }
  }

  return fields;
}
