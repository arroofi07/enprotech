import { jsPDF } from "jspdf";

import type { CertificatePdfData } from "@/lib/domain/certificates/types";

function formatIssueDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(date);
}

export function buildCertificatePdfBuffer(
  data: CertificatePdfData,
): ArrayBuffer {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(1);
  doc.rect(margin + 10, margin + 10, pageWidth - margin * 2 - 20, pageHeight - margin * 2 - 20);

  doc.setTextColor(37, 99, 235);
  doc.setFontSize(12);
  doc.text("E-TRAINING", pageWidth / 2, margin + 42, { align: "center" });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(28);
  doc.text("Sertifikat Penyelesaian", pageWidth / 2, margin + 78, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text("Diberikan kepada", pageWidth / 2, margin + 118, { align: "center" });

  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(data.studentName, pageWidth / 2, margin + 152, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "atas keberhasilan menyelesaikan program training",
    pageWidth / 2,
    margin + 182,
    { align: "center" },
  );

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(data.trainingTitle, pageWidth / 2, margin + 210, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Pre-Test: ${data.preTestScore}%  |  Post-Test: ${data.postTestScore}%  |  Nilai Akhir: ${data.finalGrade}%`,
    pageWidth / 2,
    margin + 242,
    { align: "center" },
  );

  doc.text(
    `Diterbitkan pada ${formatIssueDate(data.issuedAt)}`,
    pageWidth / 2,
    margin + 264,
    { align: "center" },
  );

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Nomor Sertifikat: ${data.certificateNumber}`,
    pageWidth / 2,
    pageHeight - margin - 28,
    { align: "center" },
  );

  doc.text(
    "Sertifikat ini dapat diverifikasi di halaman verifikasi E-Training.",
    pageWidth / 2,
    pageHeight - margin - 12,
    { align: "center" },
  );

  return doc.output("arraybuffer");
}
