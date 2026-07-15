import type { Metadata } from "next";
import { IconArrowLeft, IconMapSearch } from "@tabler/icons-react";

import { ErrorState } from "@/components/error/error-state";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
};

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      icon={IconMapSearch}
      title="Halaman tidak ditemukan"
      description="Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan. Periksa kembali tautannya."
      actions={
        <ButtonLink href="/" size="lg">
          <IconArrowLeft data-icon="inline-start" />
          Kembali ke beranda
        </ButtonLink>
      }
    />
  );
}
