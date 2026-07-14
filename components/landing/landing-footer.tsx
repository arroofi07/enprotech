import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconClock,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";

const FOOTER_COLUMNS = [
  {
    title: "Program",
    links: [
      { label: "Kelebihan", href: "#kelebihan" },
      { label: "Cara Kerja", href: "#program" },
      { label: "Verifikasi Sertifikat", href: "#verifikasi-sertifikat" },
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
            <Link href="/" className="flex items-center" aria-label="Enprotech">
              <BrandLogo className="h-10" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Education on tech — platform pelatihan kewirausahaan digital
              berbasis proyek untuk mahasiswa, dosen, dan praktisi.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <ButtonLink
                  key={social.label}
                  href={social.href}
                  variant="outline"
                  size="icon"
                  aria-label={social.label}
                  className="text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <social.icon className="size-4" />
                </ButtonLink>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">
                {column.title}
              </p>
              {column.links.map((link) => (
                <ButtonLink
                  key={link.label}
                  href={link.href}
                  variant="link"
                  className="h-auto justify-start p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </ButtonLink>
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

        <Separator className="mt-10" />
        <p className="pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} enprotech. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
