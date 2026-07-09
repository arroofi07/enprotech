import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

type LearningFlowPlaceholderProps = {
  title: string;
  description: string;
  taskId?: string;
};

export function LearningFlowPlaceholder({
  title,
  description,
  taskId,
}: LearningFlowPlaceholderProps) {
  return (
    <div className="container max-w-3xl space-y-6 p-6 md:p-8">
      <AdminPageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Fitur ini sedang dalam pengembangan.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {taskId
              ? `Akan tersedia setelah implementasi ${taskId}.`
              : "Menu sudah tersedia di sidebar; halaman akan segera dilengkapi."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
