import * as XLSX from "xlsx";

import type { ImportKind } from "./types";

const TEMPLATE_ROWS: Record<
  ImportKind,
  { sheetName: string; filename: string; rows: Record<string, string | number>[] }
> = {
  questions: {
    sheetName: "Soal",
    filename: "import-questions-template.xlsx",
    rows: [
      {
        no: 1,
        question: "Apa ibu kota Indonesia?",
        option_a: "Bandung",
        option_b: "Jakarta",
        option_c: "Surabaya",
        option_d: "Medan",
        correct_answer: "B",
      },
    ],
  },
  enrollments: {
    sheetName: "Enrollment",
    filename: "import-enrollments-template.xlsx",
    rows: [
      {
        student_email: "student@example.com",
        training_id: "00000000-0000-0000-0000-000000000000",
      },
    ],
  },
  scores: {
    sheetName: "Nilai",
    filename: "import-scores-template.xlsx",
    rows: [
      {
        student_email: "student@example.com",
        training_id: "00000000-0000-0000-0000-000000000000",
        module_name: "Modul 1",
        assessment_type: "quiz",
        score: 85,
      },
      {
        student_email: "student@example.com",
        training_id: "00000000-0000-0000-0000-000000000000",
        module_name: "",
        assessment_type: "post_test",
        score: 90,
      },
    ],
  },
};

export function buildImportTemplateBuffer(kind: ImportKind): {
  buffer: ArrayBuffer;
  filename: string;
} {
  const template = TEMPLATE_ROWS[kind];
  const worksheet = XLSX.utils.json_to_sheet(template.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, template.sheetName);

  return {
    buffer: XLSX.write(workbook, { type: "array", bookType: "xlsx" }),
    filename: template.filename,
  };
}
