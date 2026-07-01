"use client";

import { useState } from "react";
import { useLanguage } from "@/components/employee-onboarding/LanguageProvider";
import { downloadPdfBytes, loadPdfBytes } from "@/lib/employee-onboarding/fillPdf";
import type { PdfFormConfig } from "@/lib/employee-onboarding/pdfForms";

type EmbeddedPdfStepProps = {
  config: PdfFormConfig;
};

export default function EmbeddedPdfStep({ config }: EmbeddedPdfStepProps) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownload() {
    setDownloading(true);
    setDownloadError("");

    try {
      const bytes = await loadPdfBytes(config.templatePath);
      downloadPdfBytes(new Uint8Array(bytes), config.downloadFilename);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  function handleOpenInNewTab() {
    window.open(config.templatePath, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="pdfFormSection">
      <div className="pdfFormToolbar">
        <div>
          <p className="pdfFormHint">{t("embeddedPdfHint")}</p>
          <p className="pdfFormHint" style={{ marginTop: 6 }}>
            This employment application is viewer only. Because it uses XFA fields, the app cannot save edits typed
            inside the embedded PDF. Open or download it, fill it in your PDF reader, then save it separately.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="ghostButton" onClick={handleOpenInNewTab}>
            Open PDF
          </button>

          <button type="button" className="ghostButton" onClick={handleDownload} disabled={downloading}>
            {downloading ? t("downloadPreparing") : t("downloadTemplate", { title: config.title })}
          </button>
        </div>
      </div>

      {downloadError && <p className="pdfFormError">{downloadError}</p>}

      <div className="embeddedPdfShell">
        <iframe
          title={config.title}
          src={`${config.templatePath}#toolbar=1&navpanes=0&scrollbar=1`}
          className="embeddedPdfFrame"
        />
      </div>
    </div>
  );
}
