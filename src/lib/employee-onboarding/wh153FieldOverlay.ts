import type { PdfFieldValue } from "@/lib/employee-onboarding/fillPdf";

/** Minimal field shape from react-acroform (avoid importing client types in lib). */
export type Wh153SourceField = {
  name: string;
  page: number;
  rect: number[];
  type: string;
};

export type Wh153OverlayEntry = {
  overlayKey: string;
  pdfFieldName: string;
  widgetIndex: number;
};

export type Wh153OverlayMapping = {
  entries: Wh153OverlayEntry[];
};

const OVERLAY_PREFIX = "wh153:";

export function isWh153OverlayKey(key: string): boolean {
  return key.startsWith(OVERLAY_PREFIX);
}

function buildOverlayKey(pdfFieldName: string, page: number, widgetIndex: number): string {
  return `${OVERLAY_PREFIX}${pdfFieldName}|${page}|${widgetIndex}`;
}

/** Give each PDF widget its own overlay key so duplicate AcroForm names do not share input state. */
export function assignWh153OverlayKeys<T extends Wh153SourceField>(
  fields: T[]
): { fields: T[]; mapping: Wh153OverlayMapping } {
  const byPdfName = new Map<string, T[]>();

  for (const field of fields) {
    const list = byPdfName.get(field.name) ?? [];
    list.push(field);
    byPdfName.set(field.name, list);
  }

  const fieldToOverlayKey = new Map<T, string>();
  const entries: Wh153OverlayEntry[] = [];

  for (const [pdfName, widgets] of byPdfName) {
    const sorted = [...widgets].sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return (b.rect[1] ?? 0) - (a.rect[1] ?? 0);
    });

    sorted.forEach((field, widgetIndex) => {
      const overlayKey = buildOverlayKey(pdfName, field.page, widgetIndex);
      fieldToOverlayKey.set(field, overlayKey);
      entries.push({ overlayKey, pdfFieldName: pdfName, widgetIndex });
    });
  }

  return {
    fields: fields.map((field) => ({
      ...field,
      name: fieldToOverlayKey.get(field) ?? field.name,
    })),
    mapping: { entries },
  };
}

export function expandWh153FormValues(
  mapping: Wh153OverlayMapping,
  pdfValues: Record<string, PdfFieldValue>
): Record<string, PdfFieldValue> {
  const overlayValues: Record<string, PdfFieldValue> = {};
  const widgetsByPdf = new Map<string, Wh153OverlayEntry[]>();

  for (const entry of mapping.entries) {
    const list = widgetsByPdf.get(entry.pdfFieldName) ?? [];
    list.push(entry);
    widgetsByPdf.set(entry.pdfFieldName, list);
  }

  for (const [pdfName, widgets] of widgetsByPdf) {
    const raw = pdfValues[pdfName];
    if (raw === undefined || raw === null) continue;

    if (typeof raw === "boolean") {
      for (const widget of widgets) {
        overlayValues[widget.overlayKey] = raw;
      }
      continue;
    }

    const text = String(raw);
    if (!text.trim()) continue;

    const sorted = [...widgets].sort((a, b) => a.widgetIndex - b.widgetIndex);
    const parts = text.includes("\n") ? text.split("\n") : [text];

    sorted.forEach((widget, index) => {
      const part = parts[index];
      if (part && part.trim()) {
        overlayValues[widget.overlayKey] = part;
      }
    });
  }

  return overlayValues;
}

export function collapseWh153FormValues(
  mapping: Wh153OverlayMapping,
  overlayValues: Record<string, PdfFieldValue>
): Record<string, PdfFieldValue> {
  const pdfValues: Record<string, PdfFieldValue> = {};
  const textLines = new Map<string, { index: number; text: string }[]>();

  for (const entry of mapping.entries) {
    const value = overlayValues[entry.overlayKey];
    if (value === undefined || value === null) continue;

    if (typeof value === "boolean") {
      if (value) {
        pdfValues[entry.pdfFieldName] = true;
      } else if (!(entry.pdfFieldName in pdfValues)) {
        pdfValues[entry.pdfFieldName] = false;
      }
      continue;
    }

    const text = String(value).trim();
    if (!text) continue;

    const lines = textLines.get(entry.pdfFieldName) ?? [];
    lines.push({ index: entry.widgetIndex, text });
    textLines.set(entry.pdfFieldName, lines);
  }

  for (const [pdfName, lines] of textLines) {
    lines.sort((a, b) => a.index - b.index);
    pdfValues[pdfName] = lines.map((line) => line.text).join("\n");
  }

  return pdfValues;
}

export function mapWh153PdfKeysToOverlay(
  mapping: Wh153OverlayMapping,
  pdfFieldKeys: readonly string[]
): string[] {
  const keys: string[] = [];
  for (const pdfKey of pdfFieldKeys) {
    const overlays = mapping.entries
      .filter((entry) => entry.pdfFieldName === pdfKey)
      .map((entry) => entry.overlayKey);
    if (overlays.length > 0) {
      keys.push(...overlays);
    } else {
      keys.push(pdfKey);
    }
  }
  return keys;
}

export function resolveWh153ScrollTarget(
  mapping: Wh153OverlayMapping,
  pdfFieldKey: string
): string {
  const match = mapping.entries.find((entry) => entry.pdfFieldName === pdfFieldKey);
  return match?.overlayKey ?? pdfFieldKey;
}
