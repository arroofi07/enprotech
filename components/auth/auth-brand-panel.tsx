import Image from "next/image";
import {
  IconBook,
  IconCertificate,
  IconChartBar,
} from "@tabler/icons-react";

import { BrandLogo } from "@/components/brand/brand-logo";

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
    <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.17_330_/_0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.45_0.14_330_/_0.45),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10 p-10 xl:p-12">
        <BrandLogo priority className="h-12 drop-shadow-md" />

        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-sidebar-primary uppercase">
              E-Training Enprotech
            </p>
            <h2 className="font-heading max-w-md text-3xl font-semibold leading-tight tracking-tight text-sidebar-foreground xl:text-4xl">
              Belajar terarah.
              <br />
              Progres terukur.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-sidebar-muted-foreground">
              Kelola modul, pantau pencapaian, dan selesaikan evaluasi hingga
              sertifikasi dalam satu platform.
            </p>
          </div>

          <ul className="space-y-3">
            {valueProps.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/20 text-sidebar-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium text-sidebar-foreground/95">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/40 shadow-2xl">
          <div className="relative aspect-4/3">
            <Image
              src="/auth-illustration.png"
              alt="Ilustrasi peserta belajar di platform Enprotech"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-sidebar/80 via-transparent to-transparent"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-wider text-sidebar-muted-foreground uppercase">
                Progres belajar
              </p>
              <p className="font-heading mt-0.5 text-2xl font-semibold text-sidebar-foreground">
                78%
              </p>
            </div>
            <div className="rounded-full bg-sidebar-primary px-3 py-1 text-xs font-semibold text-sidebar-primary-foreground">
              12 / 16 modul
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
