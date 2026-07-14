"use client";

import Link from "next/link";
import { IconArrowRight, IconMenu2 } from "@tabler/icons-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Kelebihan", href: "#kelebihan" },
  { label: "Program", href: "#program" },
  { label: "Verifikasi", href: "#verifikasi-sertifikat" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "FAQ", href: "#faq" },
] as const;

type LandingHeaderProps = {
  dashboardHref: string | null;
};

export function LandingHeader({ dashboardHref }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Enprotech">
          <BrandLogo priority className="h-9" />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <ButtonLink
              key={link.href}
              href={link.href}
              variant="ghost"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </ButtonLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {dashboardHref ? (
            <ButtonLink
              href={dashboardHref}
              size="lg"
              className="rounded-full px-5 text-sm font-semibold"
            >
              Buka Dashboard
              <IconArrowRight className="size-4" />
            </ButtonLink>
          ) : (
            <>
              <ButtonLink
                href="/login"
                variant="ghost"
                className="rounded-full px-4 text-sm font-medium"
              >
                Masuk
              </ButtonLink>
              <ButtonLink
                href="/register"
                size="lg"
                className="rounded-full px-5 text-sm font-semibold"
              >
                Buat Akun
              </ButtonLink>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Buka menu navigasi"
              />
            }
          >
            <IconMenu2 className="size-5" />
          </SheetTrigger>
          <SheetContent side="top" className="gap-0 p-0 md:hidden">
            <SheetHeader className="border-b border-border px-4 py-4">
              <SheetTitle className="font-heading text-base">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <ButtonLink
                      href={link.href}
                      variant="ghost"
                      className="justify-start px-3 py-2 text-sm font-medium"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                {dashboardHref ? (
                  <SheetClose
                    render={
                      <ButtonLink
                        href={dashboardHref}
                        size="lg"
                        className="rounded-full text-sm font-semibold"
                      />
                    }
                  >
                    Buka Dashboard
                    <IconArrowRight className="size-4" />
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose
                      render={
                        <ButtonLink
                          href="/login"
                          variant="outline"
                          size="lg"
                          className="rounded-full text-sm font-medium"
                        />
                      }
                    >
                      Masuk
                    </SheetClose>
                    <SheetClose
                      render={
                        <ButtonLink
                          href="/register"
                          size="lg"
                          className="rounded-full text-sm font-semibold"
                        />
                      }
                    >
                      Buat Akun
                    </SheetClose>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
