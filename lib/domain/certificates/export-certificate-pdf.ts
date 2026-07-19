import { jsPDF } from "jspdf";
import { create as createQrMatrix } from "qrcode";

import type { CertificatePdfData } from "@/lib/domain/certificates/types";

type Rgb = readonly [number, number, number];

/** Brand palette, converted from the hue-330 oklch tokens in app/globals.css. */
const PLUM_DEEP: Rgb = [74, 6, 48];
const MAGENTA: Rgb = [138, 14, 90];
const GOLD_DARK: Rgb = [146, 104, 38];
const GOLD: Rgb = [193, 150, 66];
const GOLD_LIGHT: Rgb = [232, 200, 120];
const INK: Rgb = [43, 10, 30];
const MUTED: Rgb = [107, 34, 73];
const GUILLOCHE: Rgb = [252, 248, 251];

const PAGE_W = 842;
const PAGE_H = 595;
const PANEL_X = 44;
const PANEL_Y = 44;
const PANEL_W = 754;
const PANEL_H = 507;
const PANEL_RIGHT = PANEL_X + PANEL_W;
/** Text centre sits left of the wave ornament, not on the page centre. */
const CONTENT_CX = 372;

function formatIssueDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

function verifyUrl(certificateNumber: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://enprotech.id";
  return `${base.replace(/\/+$/, "")}/verify/${encodeURIComponent(certificateNumber)}`;
}

function mix(from: Rgb, to: Rgb, t: number): Rgb {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

function fill(doc: jsPDF, color: Rgb): void {
  doc.setFillColor(color[0], color[1], color[2]);
}

function stroke(doc: jsPDF, color: Rgb): void {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function ink(doc: jsPDF, color: Rgb): void {
  doc.setTextColor(color[0], color[1], color[2]);
}

type PathNode =
  | { readonly to: readonly [number, number] }
  | { readonly curve: readonly [number, number, number, number, number, number] };

/**
 * jsPDF's `lines()` takes deltas from the previous anchor; this wrapper lets the
 * ornament be described in absolute page coordinates instead.
 */
function drawPath(
  doc: jsPDF,
  start: readonly [number, number],
  nodes: readonly PathNode[],
  style: "F" | "S" | "FD",
): void {
  let [px, py] = start;
  const legs: number[][] = [];

  for (const node of nodes) {
    if ("to" in node) {
      legs.push([node.to[0] - px, node.to[1] - py]);
      [px, py] = node.to;
      continue;
    }

    const [c1x, c1y, c2x, c2y, x, y] = node.curve;
    legs.push([c1x - px, c1y - py, c2x - px, c2y - py, x - px, y - py]);
    [px, py] = [x, y];
  }

  doc.lines(legs, start[0], start[1], [1, 1], style, true);
}

/** Vertical gradient, faked with thin strips since jsPDF has no gradient fill. */
function drawBackdrop(doc: jsPDF): void {
  const bands = 64;
  const bandHeight = PAGE_H / bands;

  for (let i = 0; i < bands; i += 1) {
    fill(doc, mix(MAGENTA, PLUM_DEEP, i / (bands - 1)));
    doc.rect(0, i * bandHeight, PAGE_W, bandHeight + 0.6, "F");
  }

  // Damask-ish diagonal lattice, only ever visible on the border band.
  stroke(doc, [168, 40, 118]);
  doc.setLineWidth(0.4);
  for (let x = -PAGE_H; x < PAGE_W; x += 13) {
    doc.line(x, 0, x + PAGE_H, PAGE_H);
    doc.line(x + PAGE_H, 0, x, PAGE_H);
  }
}

function drawFrame(doc: jsPDF): void {
  stroke(doc, GOLD);
  doc.setLineWidth(2.5);
  doc.rect(16, 16, PAGE_W - 32, PAGE_H - 32, "S");

  stroke(doc, GOLD_LIGHT);
  doc.setLineWidth(0.8);
  doc.rect(26, 26, PAGE_W - 52, PAGE_H - 52, "S");
}

function drawPanel(doc: jsPDF): void {
  fill(doc, [255, 255, 255]);
  doc.roundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 3, 3, "F");

  // Guilloche texture — barely-there horizontal ruling behind the copy.
  stroke(doc, GUILLOCHE);
  doc.setLineWidth(0.35);
  for (let y = PANEL_Y + 8; y < PANEL_Y + PANEL_H - 8; y += 5) {
    doc.line(PANEL_X + 8, y, PANEL_RIGHT - 8, y);
  }

  stroke(doc, GOLD);
  doc.setLineWidth(0.7);
  doc.rect(PANEL_X + 10, PANEL_Y + 10, PANEL_W - 20, PANEL_H - 20, "S");
}

/** Layered gold-and-plum wave down the right edge, echoing the reference art. */
function drawWaveOrnament(doc: jsPDF): void {
  const wave = (dx: number, color: Rgb, style: "F" | "FD") => {
    fill(doc, color);
    stroke(doc, GOLD_LIGHT);
    doc.setLineWidth(style === "FD" ? 1.2 : 0);
    drawPath(
      doc,
      [700 + dx, PANEL_Y],
      [
        { curve: [742 + dx, 152, 626 + dx, 206, 640 + dx, 300] },
        { curve: [652 + dx, 396, 702 + dx, 472, 762 + dx, PANEL_Y + PANEL_H] },
        { to: [PANEL_RIGHT, PANEL_Y + PANEL_H] },
        { to: [PANEL_RIGHT, PANEL_Y] },
      ],
      style,
    );
  };

  wave(0, GOLD_DARK, "F");
  wave(9, GOLD, "F");
  wave(20, MAGENTA, "FD");
  wave(46, PLUM_DEEP, "F");
}

/** Award seal: concentric gold rings over ribbon tails. */
function drawSeal(doc: jsPDF, year: string): void {
  const cx = 122;
  const cy = 122;

  fill(doc, MAGENTA);
  drawPath(doc, [cx - 21, cy + 22], [{ to: [cx - 31, cy + 66] }, { to: [cx - 9, cy + 54] }], "F");
  drawPath(doc, [cx + 21, cy + 22], [{ to: [cx + 31, cy + 66] }, { to: [cx + 9, cy + 54] }], "F");

  fill(doc, GOLD_DARK);
  doc.circle(cx, cy, 38, "F");
  fill(doc, GOLD);
  doc.circle(cx, cy, 34, "F");
  fill(doc, GOLD_LIGHT);
  doc.circle(cx, cy, 29, "F");
  fill(doc, MAGENTA);
  doc.circle(cx, cy, 26, "F");
  stroke(doc, GOLD_LIGHT);
  doc.setLineWidth(0.7);
  doc.circle(cx, cy, 22, "S");

  ink(doc, GOLD_LIGHT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.6);
  doc.setCharSpace(0.2);
  doc.text("ENPROTECH", cx, cy - 7, { align: "center" });
  doc.setCharSpace(0);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(year, cx, cy + 6, { align: "center" });

  ink(doc, GOLD_LIGHT);
  doc.setFontSize(4);
  doc.setCharSpace(0.2);
  doc.text("E-TRAINING", cx, cy + 16, { align: "center" });
  doc.setCharSpace(0);
}

/** Gold rule with a diamond at each end. */
function drawRule(doc: jsPDF, x1: number, x2: number, y: number): void {
  stroke(doc, GOLD);
  doc.setLineWidth(1.1);
  doc.line(x1 + 8, y, x2 - 8, y);

  fill(doc, GOLD);
  for (const x of [x1, x2]) {
    drawPath(
      doc,
      [x, y - 3.2],
      [{ to: [x + 3.2, y] }, { to: [x, y + 3.2] }, { to: [x - 3.2, y] }],
      "F",
    );
  }
}

/** Shrinks the font until the text fits `maxWidth` on one line. */
function fitFontSize(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
): number {
  let size = startSize;
  doc.setFontSize(size);
  while (size > minSize && doc.getTextWidth(text) > maxWidth) {
    size -= 1;
    doc.setFontSize(size);
  }
  return size;
}

function drawQrCode(doc: jsPDF, url: string, x: number, y: number, size: number): void {
  const matrix = createQrMatrix(url, { errorCorrectionLevel: "M" });
  const count = matrix.modules.size;
  const data = matrix.modules.data;
  const cell = size / count;

  fill(doc, [255, 255, 255]);
  doc.rect(x - 4, y - 4, size + 8, size + 8, "F");
  stroke(doc, GOLD);
  doc.setLineWidth(0.6);
  doc.rect(x - 4, y - 4, size + 8, size + 8, "S");

  fill(doc, INK);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (data[row * count + col]) {
        // Slight overdraw closes hairline seams between modules.
        doc.rect(x + col * cell, y + row * cell, cell + 0.12, cell + 0.12, "F");
      }
    }
  }
}

function drawSignatureBlock(
  doc: jsPDF,
  cx: number,
  y: number,
  label: string,
  value?: string,
): void {
  if (value) {
    ink(doc, INK);
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.text(value, cx, y - 8, { align: "center" });
  }

  stroke(doc, GOLD_DARK);
  doc.setLineWidth(1);
  doc.line(cx - 85, y, cx + 85, y);

  ink(doc, MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setCharSpace(1.2);
  doc.text(label, cx, y + 13, { align: "center" });
  doc.setCharSpace(0);
}

export function buildCertificatePdfBuffer(
  data: CertificatePdfData,
): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  drawBackdrop(doc);
  drawPanel(doc);
  drawWaveOrnament(doc);
  drawFrame(doc);

  const issued = new Date(data.issuedAt);
  const year = Number.isNaN(issued.getTime())
    ? String(new Date().getUTCFullYear())
    : String(issued.getUTCFullYear());
  drawSeal(doc, year);

  ink(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(31);
  doc.setCharSpace(6);
  doc.text("SERTIFIKAT", CONTENT_CX + 3, 148, { align: "center" });
  doc.setCharSpace(0);

  ink(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setCharSpace(2.6);
  doc.text("PENYELESAIAN PELATIHAN", CONTENT_CX + 1, 172, { align: "center" });
  doc.setCharSpace(0);

  drawRule(doc, CONTENT_CX - 60, CONTENT_CX + 60, 190);

  ink(doc, MUTED);
  doc.setFontSize(9.5);
  doc.setCharSpace(1.1);
  doc.text(
    "SERTIFIKAT INI DENGAN BANGGA DIBERIKAN KEPADA",
    CONTENT_CX,
    222,
    { align: "center" },
  );
  doc.setCharSpace(0);

  ink(doc, INK);
  doc.setFont("times", "bolditalic");
  fitFontSize(doc, data.studentName, 480, 36, 18);
  doc.text(data.studentName, CONTENT_CX, 272, { align: "center" });

  drawRule(doc, CONTENT_CX - 220, CONTENT_CX + 220, 290);

  ink(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "atas keberhasilan menyelesaikan seluruh rangkaian program pelatihan",
    CONTENT_CX,
    316,
    { align: "center" },
  );

  ink(doc, INK);
  doc.setFont("helvetica", "bold");
  fitFontSize(doc, data.trainingTitle, 430, 16, 11);
  const titleLines = doc.splitTextToSize(data.trainingTitle, 430) as string[];
  doc.text(titleLines, CONTENT_CX, 340, { align: "center" });

  drawQrCode(doc, verifyUrl(data.certificateNumber), 74, 432, 58);
  ink(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Pindai untuk verifikasi", 103, 504, { align: "center" });

  drawSignatureBlock(doc, 288, 466, "TANDA TANGAN");
  drawSignatureBlock(doc, 528, 466, "TANGGAL", formatIssueDate(data.issuedAt));

  ink(doc, MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setCharSpace(0.9);
  doc.text(
    `NOMOR SERTIFIKAT  ·  ${data.certificateNumber}`,
    CONTENT_CX,
    528,
    { align: "center" },
  );
  doc.setCharSpace(0);

  return doc.output("arraybuffer");
}
