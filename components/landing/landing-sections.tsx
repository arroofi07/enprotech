import {
  IconArrowRight,
  IconBriefcase,
  IconCertificate,
  IconChalkboard,
  IconDeviceLaptop,
  IconMail,
  IconMapPin,
  IconQuote,
} from "@tabler/icons-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATS = [
  { value: "12+", label: "Modul Praktis" },
  { value: "24/7", label: "Mentorship" },
  { value: "OFFICIAL", label: "Certificates" },
] as const;

const FEATURES = [
  {
    icon: IconBriefcase,
    title: "Berbasis Proyek",
    description:
      "Bukan sekadar teori, Anda akan membangun bisnis dari nol berdasarkan studi kasus nyata.",
  },
  {
    icon: IconChalkboard,
    title: "Mentoring Eksklusif",
    description:
      "Dibimbing langsung oleh trainer, praktisi industri, dan akademisi berpengalaman.",
  },
  {
    icon: IconDeviceLaptop,
    title: "Akses Fleksibel",
    description:
      "Belajar kapan saja dan di mana saja melalui platform E-training modern kami.",
  },
  {
    icon: IconCertificate,
    title: "Sertifikat Resmi",
    description:
      "Sertifikat digital yang diakui untuk meningkatkan portofolio profesional Anda.",
  },
] as const;

const STEPS = [
  {
    title: "Buat akun & lengkapi profil",
    description:
      "Daftar sebagai mahasiswa, dosen, atau praktisi dari perguruan tinggi mana saja, lalu lengkapi profil Anda.",
  },
  {
    title: "Ikuti pelatihan berbasis proyek",
    description:
      "Selama 8–12 minggu, bangun bisnis digital dari nol dengan bimbingan mentor dan simulasi bisnis nyata.",
  },
  {
    title: "Selesaikan proyek & raih sertifikat",
    description:
      "Setelah evaluasi proyek akhir, dapatkan sertifikat digital resmi untuk memperkuat portofolio Anda.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Program ini sangat membuka wawasan saya bagaimana membangun startup yang scalable. Sangat aplikatif!",
    name: "Lina Marlina",
    role: "Peserta",
  },
  {
    quote:
      "E-training enprotech yang digunakan sangat membantu dosen dalam membimbing mahasiswa ke arah praktis.",
    name: "Rini Widyastuti, S.Kom., M.Kom",
    role: "Trainer",
  },
] as const;

const FAQS = [
  {
    question: "Siapa yang boleh mendaftar?",
    answer: "Mahasiswa dan dosen dari perguruan tinggi mana saja.",
  },
  {
    question: "Bagaimana cara mendaftar?",
    answer:
      'Klik "Buat Akun" di bagian header dan lengkapi profil Anda untuk mulai belajar.',
  },
  {
    question: "Apakah ada biaya?",
    answer:
      "Beberapa batch tersedia secara gratis, lainnya mendapatkan subsidi dari kampus.",
  },
  {
    question: "Apakah mendapat sertifikat?",
    answer:
      "Ya, sertifikat digital resmi diberikan setelah evaluasi proyek akhir.",
  },
  {
    question: "Berapa lama durasi pelatihan?",
    answer: "Rata-rata 8–12 minggu dengan sistem pengerjaan proyek.",
  },
] as const;

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider text-primary">
        {label}
      </Badge>
      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function LandingStats() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Card className="rounded-3xl py-8">
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-4xl font-semibold text-primary sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section id="kelebihan" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        label="Kelebihan Program"
        title="Pengalaman pelatihan yang aplikatif"
        description="Didesain secara khusus untuk memberikan pengalaman pelatihan yang aplikatif dan relevan dengan kebutuhan industri saat ini."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="rounded-3xl">
            <CardHeader>
              <Badge className="size-11 rounded-xl bg-primary/10 p-0 text-primary">
                <feature.icon className="size-5" />
              </Badge>
              <CardTitle className="font-heading text-lg font-semibold">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function LandingSteps() {
  return (
    <section id="program" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Card className="rounded-3xl border-0 bg-sidebar py-8 text-sidebar-foreground ring-0 sm:py-12">
        <CardHeader className="max-w-xl">
          <Badge
            variant="secondary"
            className="text-xs font-semibold uppercase tracking-wider text-sidebar-primary"
          >
            Cara kerja
          </Badge>
          <CardTitle className="mt-3 font-heading text-3xl font-semibold tracking-tight text-sidebar-foreground sm:text-4xl">
            Mulai perjalanan belajar Anda dalam tiga langkah.
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card
              key={step.title}
              className="rounded-2xl border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground ring-sidebar-border"
            >
              <CardHeader>
                <Badge className="size-9 rounded-full bg-sidebar-primary p-0 text-sm font-semibold text-sidebar-primary-foreground">
                  {index + 1}
                </Badge>
                <CardTitle className="font-heading text-lg font-semibold text-sidebar-foreground">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-sidebar-muted-foreground">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function LandingTestimonials() {
  return (
    <section id="testimoni" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        label="Suara Peserta"
        title="Apa kata mereka yang telah bergabung"
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.name} className="rounded-3xl">
            <CardHeader>
              <IconQuote className="size-8 text-primary/40" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <blockquote className="text-base leading-relaxed text-foreground">
                {testimonial.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {testimonial.role}
                  </span>
                </span>
              </figcaption>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function LandingFaq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading
        label="Pertanyaan Umum"
        title="Temukan jawaban yang Anda cari"
      />

      <Accordion className="mt-10 rounded-2xl border-border">
        {FAQS.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger className="px-5 py-4 text-sm font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-5 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function LandingCta() {
  return (
    <section id="kontak" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-sidebar py-8 text-sidebar-foreground ring-0 sm:py-14">
        <CardContent className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-lg">
            <CardTitle className="font-heading text-3xl font-semibold tracking-tight text-sidebar-foreground sm:text-4xl">
              Siap menjadi generasi digital leader berikutnya?
            </CardTitle>
            <CardDescription className="mt-3 text-sm leading-relaxed text-sidebar-muted-foreground">
              Ada pertanyaan lebih lanjut atau tertarik untuk berkolaborasi? Tim
              kami siap membantu Anda.
            </CardDescription>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/register"
                size="lg"
                className="rounded-full bg-sidebar-primary px-6 py-3 text-sm font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              >
                Buat Akun
                <IconArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href="/login"
                variant="outline"
                size="lg"
                className="rounded-full border-sidebar-border px-6 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              >
                Masuk
              </ButtonLink>
            </div>
          </div>

          <Card className="rounded-2xl border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground ring-sidebar-border">
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-start gap-3">
                <IconMapPin className="mt-0.5 size-5 shrink-0 text-sidebar-primary" />
                <div>
                  <CardDescription className="text-xs uppercase tracking-wider text-sidebar-muted-foreground">
                    Lokasi
                  </CardDescription>
                  <CardTitle className="text-sm font-medium text-sidebar-foreground">
                    Kota Padang, Sumatera Barat
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IconMail className="mt-0.5 size-5 shrink-0 text-sidebar-primary" />
                <div>
                  <CardDescription className="text-xs uppercase tracking-wider text-sidebar-muted-foreground">
                    Email
                  </CardDescription>
                  <CardTitle className="text-sm font-medium text-sidebar-foreground">
                    <a
                      href="mailto:support@en-protech.com"
                      className="hover:underline"
                    >
                      support@en-protech.com
                    </a>
                  </CardTitle>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
}
