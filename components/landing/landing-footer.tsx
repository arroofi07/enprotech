import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconClock,
  IconMail,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";

const FOOTER_COLUMNS = [
  {
    title: "Program",
    links: [
      { label: "Kelebihan", href: "#kelebihan" },
      { label: "Cara Kerja", href: "#program" },
      { label: "Testimoni", href: "#testimoni" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Masuk", href: "/login" },
      { label: "Buat Akun", href: "/register" },
      { label: "Verifikasi Sertifikat", href: "/verify" },
    ],
  },
] as const;

const CONTACT_INFO = [
  { icon: IconMapPin, text: "Kota Padang, Sumatera Barat" },
  { icon: IconMail, text: "support@en-protech.com" },
  { icon: IconClock, text: "Senin – Jumat: 09.00 – 17.00 WIB" },
] as const;

const SOCIAL_LINKS = [
  { icon: IconBrandLinkedin, href: "#", label: "LinkedIn" },
  { icon: IconBrandX, href: "#", label: "X" },
  { icon: IconBrandInstagram, href: "#", label: "Instagram" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconSparkles className="size-4" />
              </span>
              <span className="font-heading text-base font-semibold tracking-tight">
                enprotech
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Education on tech — platform pelatihan kewirausahaan digital
              berbasis proyek untuk mahasiswa, dosen, dan praktisi.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">
                {column.title}
              </p>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">Hubungi Kami</p>
            {CONTACT_INFO.map((info) => (
              <div
                key={info.text}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <info.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{info.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} enprotech. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
