import * as XLSX from "xlsx";

import type { ImportPreview, ImportRow } from "./types";

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function getCellValue(row: Record<string, unknown>, key: string): string {
  const normalizedKey = normalizeHeader(key);
  const entry = Object.entries(row).find(
    ([header]) => normalizeHeader(header) === normalizedKey,
  );

  if (!entry) {
    return "";
  }

  const value = entry[1];
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function readExcelRows(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("File Excel tidak memiliki sheet.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rawRows.map((row) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] =
        value === null || value === undefined ? "" : String(value).trim();
    }
    return normalized;
  });
}

export function buildImportPreview<T>(
  rows: ImportRow<T>[],
): ImportPreview<T> {
  const validCount = rows.filter((row) => row.isValid).length;

  return {
    rows,
    totalCount: rows.length,
    validCount,
    invalidCount: rows.length - validCount,
  };
}
