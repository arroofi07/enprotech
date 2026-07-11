import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import {
  LandingCertificateVerification,
  LandingCta,
  LandingFaq,
  LandingFeatures,
  LandingStats,
  LandingSteps,
  LandingTestimonials,
} from "@/components/landing/landing-sections";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getDashboardPath } from "@/lib/domain/auth/permissions";

export default async function HomePage() {
  const user = await getCurrentUser();
  const dashboardHref = user ? getDashboardPath(user.role) : null;

  return (
    <div className="flex min-h-full flex-col">
      <LandingHeader dashboardHref={dashboardHref} />
      <main className="flex-1">
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingSteps />
        <LandingCertificateVerification />
        <LandingTestimonials />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
