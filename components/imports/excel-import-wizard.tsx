"use client";

import { useMemo, useState } from "react";
import { IconDownload, IconUpload } from "@tabler/icons-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type {
  ImportCommitResult,
  ImportKind,
  ImportPreview,
} from "@/lib/domain/imports/types";

type TrainingOption = {
  id: string;
  title: string;
};

type ModuleOption = {
  id: string;
  title: string;
};

type WizardStep = "upload" | "preview" | "result";

type ExcelImportWizardProps = {
  kind: ImportKind;
  trainings: TrainingOption[];
};

const KIND_LABELS: Record<ImportKind, string> = {
  questions: "Soal Quiz/Latihan",
  enrollments: "Enrollment Student",
  scores: "Nilai Training",
};

const KIND_ENDPOINTS: Record<ImportKind, string> = {
  questions: "/api/import/questions",
  enrollments: "/api/import/enrollments",
  scores: "/api/import/scores",
};

function previewColumns(preview: ImportPreview<Record<string, unknown>>) {
  const sample = preview.rows[0]?.raw ?? {};
  const keys = Object.keys(sample);

  return [
    {
      id: "rowNumber",
      header: "Baris",
      cell: (row: (typeof preview.rows)[number]) => row.rowNumber,
    },
    ...keys.map((key) => ({
      id: key,
      header: key,
      cell: (row: (typeof preview.rows)[number]) => row.raw[key] ?? "-",
    })),
    {
      id: "status",
      header: "Status",
      cell: (row: (typeof preview.rows)[number]) =>
        row.isValid ? (
          <Badge>Valid</Badge>
        ) : (
          <Badge variant="destructive">Error</Badge>
        ),
    },
    {
      id: "errors",
      header: "Pesan Error",
      cell: (row: (typeof preview.rows)[number]) =>
        row.errors.length > 0 ? row.errors.join("; ") : "-",
    },
  ];
}

export function ExcelImportWizard({ kind, trainings }: ExcelImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview<Record<string, unknown>> | null>(null);
  const [result, setResult] = useState<ImportCommitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [trainingId, setTrainingId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [assessmentType, setAssessmentType] = useState<"quiz" | "latihan">("quiz");
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [assessmentId, setAssessmentId] = useState("");

  const templateHref = `/api/import/templates/${kind}`;
  const endpoint = KIND_ENDPOINTS[kind];

  const columns = useMemo(
    () => (preview ? previewColumns(preview) : []),
    [preview],
  );

  async function loadModules(nextTrainingId: string) {
    setModuleId("");
    setModules([]);
    if (!nextTrainingId) {
      return;
    }

    const response = await fetch(`/api/trainings/${nextTrainingId}/modules`);
    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as ModuleOption[];
    setModules(data);
  }

  async function resolveAssessmentId(): Promise<string | null> {
    if (!trainingId) {
      setError("Pilih training terlebih dahulu.");
      return null;
    }

    if (!moduleId) {
      setError("Pilih modul terlebih dahulu.");
      return null;
    }

    const response = await fetch(
      `/api/modules/${moduleId}/assessments?type=${assessmentType}`,
    );
    if (!response.ok) {
      setError("Gagal mengambil assessment modul.");
      return null;
    }

    const data = (await response.json()) as { id: string };
    setAssessmentId(data.id);
    return data.id;
  }

  async function handlePreview() {
    if (!file) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (kind === "questions") {
        const resolvedAssessmentId = assessmentId || (await resolveAssessmentId());
        if (!resolvedAssessmentId) {
          setLoading(false);
          return;
        }
        formData.append("assessmentId", resolvedAssessmentId);
      }

      const response = await fetch(`${endpoint}?mode=preview`, {
        method: "POST",
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message ?? "Gagal memproses preview.");
      }

      setPreview(body as ImportPreview<Record<string, unknown>>);
      setStep("preview");
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Gagal memproses preview.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (kind === "questions") {
        const resolvedAssessmentId = assessmentId || (await resolveAssessmentId());
        if (!resolvedAssessmentId) {
          setLoading(false);
          return;
        }
        formData.append("assessmentId", resolvedAssessmentId);
      }

      const response = await fetch(`${endpoint}?mode=commit`, {
        method: "POST",
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message ?? "Gagal mengimport data.");
      }

      setResult(body as ImportCommitResult);
      setStep("result");
    } catch (commitError) {
      setError(
        commitError instanceof Error
          ? commitError.message
          : "Gagal mengimport data.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadErrorReport() {
    if (!preview) {
      return;
    }

    const response = await fetch("/api/import/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preview }),
    });

    if (!response.ok) {
      setError("Gagal mengunduh laporan error.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "import-errors.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function resetWizard() {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setAssessmentId("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{KIND_LABELS[kind]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {step === "upload" ? (
          <div className="space-y-4">
            <a
              href={templateHref}
              className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-muted"
            >
              <IconDownload className="size-4" />
              Unduh Template Excel
            </a>

            {kind === "questions" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`training-${kind}`}>Training</Label>
                  <select
                    id={`training-${kind}`}
                    value={trainingId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTrainingId(value);
                      void loadModules(value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Pilih training</option>
                    {trainings.map((training) => (
                      <option key={training.id} value={training.id}>
                        {training.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`module-${kind}`}>Modul</Label>
                  <select
                    id={`module-${kind}`}
                    value={moduleId}
                    onChange={(event) => setModuleId(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    disabled={!trainingId}
                  >
                    <option value="">Pilih modul</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`type-${kind}`}>Jenis Assessment</Label>
                  <select
                    id={`type-${kind}`}
                    value={assessmentType}
                    onChange={(event) =>
                      setAssessmentType(event.target.value as "quiz" | "latihan")
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="latihan">Latihan</option>
                  </select>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor={`file-${kind}`}>File Excel (.xlsx)</Label>
              <Input
                id={`file-${kind}`}
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                }}
              />
            </div>

            <Button type="button" onClick={() => void handlePreview()} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : <IconUpload className="size-4" />}
              Upload & Preview
            </Button>
          </div>
        ) : null}

        {step === "preview" && preview ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Total: {preview.totalCount}</span>
              <span>Valid: {preview.validCount}</span>
              <span>Error: {preview.invalidCount}</span>
            </div>

            <DataTable
              columns={columns}
              data={preview.rows}
              getRowKey={(row) => String(row.rowNumber)}
              emptyState={{ message: "Tidak ada baris pada file." }}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={resetWizard}>
                Upload Ulang
              </Button>
              {preview.invalidCount > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDownloadErrorReport()}
                >
                  Unduh Error Report
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={() => void handleCommit()}
                disabled={loading || preview.validCount === 0}
              >
                {loading ? <Spinner className="size-4" /> : null}
                Import {preview.validCount} Baris Valid
              </Button>
            </div>
          </div>
        ) : null}

        {step === "result" && result ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Import selesai. Berhasil: {result.successCount}, gagal:{" "}
                {result.failedCount}.
              </AlertDescription>
            </Alert>

            {result.errors.length > 0 ? (
              <div className="rounded-lg border p-4 text-sm">
                <p className="mb-2 font-medium">Baris gagal:</p>
                <ul className="space-y-1 text-muted-foreground">
                  {result.errors.map((item) => (
                    <li key={item.rowNumber}>
                      Baris {item.rowNumber}: {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Button type="button" onClick={resetWizard}>
              Import File Lain
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
