import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import type { StudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";

type StudentTrainingFlowBannerProps = {
  trainingId: string;
  flow: StudentTrainingFlowState;
};

export function StudentTrainingFlowBanner({
  trainingId,
  flow,
}: StudentTrainingFlowBannerProps) {
  if (!flow.isPretestActive && !flow.hasCompletedPretest) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Pre-Test</h3>
            <Badge variant="secondary">Belum Aktif</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-test belum diaktifkan oleh trainer. Modul akan terbuka setelah
            Anda menyelesaikan pre-test.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!flow.hasCompletedPretest) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Pre-Test Wajib</h3>
            <Badge variant="secondary">Belum Dikerjakan</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Kerjakan pre-test terlebih dahulu sebelum mengakses modul pembelajaran.
            Jika belum lulus, pre-test dapat dikerjakan kembali.
          </p>
          <ButtonLink href={`/student/trainings/${trainingId}/pre-test`}>
            Kerjakan Pre-Test
          </ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-2 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Pre-Test</h3>
            <Badge>Selesai</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Nilai pre-test: {flow.pretestBestScore ?? 0}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Post-Test</h3>
            {!flow.allModulesCompleted ? (
              <Badge variant="secondary">Terkunci</Badge>
            ) : flow.hasPassedPostTest ? (
              <Badge>Lulus</Badge>
            ) : (
              <Badge variant="secondary">Belum Lulus</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {!flow.allModulesCompleted
              ? "Selesaikan semua modul untuk membuka post-test."
              : flow.hasPassedPostTest
                ? `Nilai terbaik: ${flow.postTestBestScore ?? 0}%. Anda memenuhi syarat sertifikat.`
                : flow.postTestBestScore !== null && flow.postTestBestScore > 0
                  ? `Nilai terbaik: ${flow.postTestBestScore}%. Retry tersedia sampai lulus.`
                  : "Kerjakan post-test untuk menyelesaikan training."}
          </p>
          {flow.allModulesCompleted ? (
            <ButtonLink href={`/student/trainings/${trainingId}/post-test`}>
              {flow.hasPassedPostTest ? "Lihat Post-Test" : "Kerjakan Post-Test"}
            </ButtonLink>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
