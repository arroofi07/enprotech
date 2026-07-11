import {
  IconArrowRight,
  IconCertificate,
  IconCircleCheckFilled,
  IconPlayerPlayFilled,
  IconRocket,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AUDIENCE = ["Peserta", "Trainer", "Praktisi"] as const;

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 size-112 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -left-32 size-96 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-6">
          <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1 text-xs font-medium">
            <IconRocket className="size-3.5 text-primary" />
            Program Digital Entrepreneurship 2026
          </Badge>

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
            <ButtonLink
              href="/register"
              size="lg"
              className="h-11 rounded-full px-6 text-sm font-semibold"
            >
              Mulai Latihan Sekarang
              <IconArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="#kelebihan"
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6 text-sm font-medium"
            >
              Pelajari Enprotech
            </ButtonLink>
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
      <Card className="gap-0 rounded-3xl border-0 bg-linear-to-br from-primary to-sidebar py-6 text-primary-foreground shadow-2xl shadow-primary/30 ring-0">
        <CardContent className="flex items-center justify-between px-6 pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 after:border-white/20">
              <AvatarFallback className="bg-white/15 text-sm font-semibold text-primary-foreground">
                AR
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-primary-foreground/70">Selamat datang,</p>
              <p className="text-sm font-semibold text-primary-foreground">
                Ahmad Rizki
              </p>
            </div>
          </div>
          <Badge className="h-auto shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[0.65rem] font-medium text-primary-foreground hover:bg-white/15">
            Peserta
          </Badge>
        </CardContent>

        <CardContent className="px-6 pt-6">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-primary-foreground/70">Progres pelatihan</p>
            <div className="mt-1 flex items-end justify-between gap-4">
              <p className="font-heading text-4xl font-semibold text-primary-foreground">
                72%
              </p>
              <span className="mb-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] text-primary-foreground">
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
                  <Progress
                    value={module.value}
                    className="mt-1 w-full gap-0 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-indicator]:bg-white **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:rounded-full **:data-[slot=progress-track]:bg-white/15"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="absolute -bottom-6 -left-6 hidden w-52 rounded-2xl shadow-xl sm:block">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconCertificate className="size-5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">Sertifikat</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <IconCircleCheckFilled className="size-3.5 text-primary" />
              Terverifikasi
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
