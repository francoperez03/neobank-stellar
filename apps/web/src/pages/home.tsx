import { FloatingNav } from "@/components/nav/floating-nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AgenticPayments } from "@/components/landing/agentic-payments";
import { Pricing } from "@/components/landing/pricing";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Footer } from "@/components/landing/footer";

export function Home() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <FloatingNav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <AgenticPayments />
        <Pricing />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
