"use client";

import { IconFolderOpen } from "@tabler/icons-react";

import { ProjectDetailDialog } from "@/components/projects/project-detail-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { ProjectListItem } from "@/lib/infrastructure/db/repositories/project-repository";

type ProjectsTableProps = {
  projects: ProjectListItem[];
};

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const columns: DataTableColumn<ProjectListItem>[] = [
  {
    id: "student",
    header: "Peserta",
    cell: (project) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{project.studentName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {project.studentEmail}
        </p>
      </div>
    ),
  },
  {
    id: "training",
    header: "Training",
    cell: (project) => (
      <span className="text-sm">{project.trainingTitle}</span>
    ),
  },
  {
    id: "image",
    header: "Gambar",
    cell: (project) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.imageUrl}
        alt={project.title ?? "Gambar project"}
        className="size-12 rounded-md border object-cover"
      />
    ),
  },
  {
    id: "updatedAt",
    header: "Diperbarui",
    cell: (project) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(project.updatedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: <span className="sr-only">Aksi</span>,
    headerClassName: "text-right",
    className: "text-right",
    cell: (project) => <ProjectDetailDialog project={project} />,
  },
];

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={projects}
      getRowKey={(project) => project.id}
      emptyState={{
        message: "Belum ada project yang dikumpulkan peserta.",
        icon: IconFolderOpen,
      }}
    />
  );
}
