import Link from "next/link";
import {
  IconArrowRight,
  IconCertificate,
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
  IconRocket,
} from "@tabler/icons-react";

const AUDIENCE = ["Peserta", "Trainer", "Praktisi"] as const;

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 -right-24 size-112 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -left-32 size-96 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <IconRocket className="size-3.5 text-primary" />
            Program Digital Entrepreneurship 2026
          </span>

          <h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            The Next Gen of
            <br />
            Digital Leaders.
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Platform pelatihan kewirausahaan berbasis proyek yang dirancang untuk
            menjembatani ide kreatif Anda dengan kebutuhan industri.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Mulai Latihan Sekarang
              <IconArrowRight className="size-4" />
            </Link>
            <a
              href="#kelebihan"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Pelajari Enprotech
            </a>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Terbuka untuk mahasiswa &amp; dosen perguruan tinggi
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {AUDIENCE.map((name) => (
                <span
                  key={name}
                  className="font-heading text-sm font-semibold text-foreground/70"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  const modules = [
    { name: "Ideasi & Validasi Bisnis", value: 100 },
    { name: "Prototipe Produk Digital", value: 72 },
    { name: "Strategi Go-to-Market", value: 45 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-3xl bg-linear-to-br from-primary to-sidebar p-6 text-primary-foreground shadow-2xl shadow-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
              AR
            </span>
            <div>
              <p className="text-sm font-medium text-primary-foreground/70">
                Selamat datang,
              </p>
              <p className="text-sm font-semibold text-primary-foreground">
                Ahmad Rizki
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.65rem] font-medium">
            Peserta
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-xs text-primary-foreground/70">Progres pelatihan</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-heading text-4xl font-semibold text-primary-foreground">
              72%
            </p>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem]">
              <IconPlayerPlayFilled className="size-3" />
              Lanjut belajar
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {modules.map((module) => (
              <div key={module.name}>
                <div className="flex items-center justify-between text-[0.7rem] text-primary-foreground/80">
                  <span>{module.name}</span>
                  <span>{module.value}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${module.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden w-52 rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconCertificate className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Sertifikat</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconCircleCheckFilled className="size-3.5 text-primary" />
              Terverifikasi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
