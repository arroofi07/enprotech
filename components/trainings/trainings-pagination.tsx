import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type TrainingsPaginationProps = {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));
  return `/trainer/trainings?${params.toString()}`;
}

export function TrainingsPagination({
  page,
  totalPages,
  searchParams,
}: TrainingsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? buildHref(page - 1, searchParams) : "#"}
            text="Sebelumnya"
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href={buildHref(page, searchParams)} isActive>
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <span className="px-2 text-xs text-muted-foreground">
            dari {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? buildHref(page + 1, searchParams) : "#"}
            text="Berikutnya"
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
