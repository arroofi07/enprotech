import Image from "next/image";
import {
  IconBook,
  IconCertificate,
  IconChartBar,
} from "@tabler/icons-react";

const valueProps = [
  {
    icon: IconBook,
    label: "Modul pelatihan terstruktur",
  },
  {
    icon: IconChartBar,
    label: "Pantau progres belajar",
  },
  {
    icon: IconCertificate,
    label: "Sertifikasi & evaluasi",
  },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary to-sidebar p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between [&_h2]:text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/3 size-48 -translate-y-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
      />

      <div className="relative z-10">
        <span className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
          E-Training Enprotech
        </span>
      </div>

      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Tingkatkan kompetensi lewat pelatihan internal.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/90">
            Platform terpadu untuk mengelola modul pelatihan, memantau progres
            peserta, dan menyelesaikan evaluasi serta sertifikasi.
          </p>
        </div>

        <ul className="space-y-3">
          {valueProps.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground backdrop-blur">
                <Icon className="size-4" />
              </span>
              <span className="text-sm font-medium text-primary-foreground">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 my-4 flex justify-center">
        <div className="relative aspect-4/3 w-full max-w-[380px] overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 shadow-2xl backdrop-blur-xs">
          <Image
            src="/auth-illustration.png"
            alt="Ilustrasi Mahasiswa Belajar"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="relative z-10 flex gap-4">
        <div className="rounded-2xl border border-primary-foreground/25 bg-primary-foreground/12 p-4 backdrop-blur">
          <p className="text-xs font-medium text-primary-foreground/90">
            Progres belajar
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-foreground">78%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20">
            <div className="h-full w-[78%] rounded-full bg-primary-foreground" />
          </div>
        </div>

        <div className="rounded-2xl border border-primary-foreground/25 bg-primary-foreground/12 p-4 backdrop-blur">
          <p className="text-xs font-medium text-primary-foreground/90">
            Modul selesai
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-foreground">12</p>
          <p className="mt-2 text-xs text-primary-foreground/80">
            dari 16 modul aktif
          </p>
        </div>
      </div>
    </div>
  );
}
