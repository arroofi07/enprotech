import Link from "next/link";
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

export function LandingStats() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 rounded-3xl border border-border bg-card p-8 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-heading text-4xl font-semibold text-primary sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section id="kelebihan" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Kelebihan Program
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Pengalaman pelatihan yang aplikatif
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Didesain secara khusus untuk memberikan pengalaman pelatihan yang
          aplikatif dan relevan dengan kebutuhan industri saat ini.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" />
            </span>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingSteps() {
  return (
    <section id="program" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-sidebar p-8 text-sidebar-foreground sm:p-12">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-primary">
            Cara kerja
          </span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-sidebar-foreground sm:text-4xl">
            Mulai perjalanan belajar Anda dalam tiga langkah.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-6"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-sidebar-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sidebar-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingTestimonials() {
  return (
    <section id="testimoni" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Suara Peserta
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Apa kata mereka yang telah bergabung
        </h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-8"
          >
            <IconQuote className="size-8 text-primary/40" />
            <blockquote className="text-base leading-relaxed text-foreground">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-2 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {testimonial.name.charAt(0)}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {testimonial.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {testimonial.role}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function LandingFaq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Pertanyaan Umum
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Temukan jawaban yang Anda cari
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
              {faq.question}
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function LandingCta() {
  return (
    <section id="kontak" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl bg-sidebar p-8 text-sidebar-foreground sm:p-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-lg">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-sidebar-foreground sm:text-4xl">
              Siap menjadi generasi digital leader berikutnya?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-sidebar-muted-foreground">
              Ada pertanyaan lebih lanjut atau tertarik untuk berkolaborasi? Tim
              kami siap membantu Anda.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-sidebar-primary px-6 py-3 text-sm font-semibold text-sidebar-primary-foreground transition-colors hover:opacity-90"
              >
                Buat Akun
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-sidebar-border px-6 py-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              >
                Masuk
              </Link>
            </div>
          </div>

          <dl className="grid gap-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-6">
            <div className="flex items-start gap-3">
              <IconMapPin className="mt-0.5 size-5 shrink-0 text-sidebar-primary" />
              <div>
                <dt className="text-xs uppercase tracking-wider text-sidebar-muted-foreground">
                  Lokasi
                </dt>
                <dd className="text-sm font-medium text-sidebar-foreground">
                  Kota Padang, Sumatera Barat
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconMail className="mt-0.5 size-5 shrink-0 text-sidebar-primary" />
              <div>
                <dt className="text-xs uppercase tracking-wider text-sidebar-muted-foreground">
                  Email
                </dt>
                <dd className="text-sm font-medium text-sidebar-foreground">
                  <a
                    href="mailto:support@en-protech.com"
                    className="hover:underline"
                  >
                    support@en-protech.com
                  </a>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
