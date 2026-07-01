import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PhotonWordmark } from "@/components/brand/photon-mark";
import { Pill } from "@/components/ui/pill";

const LINKS = [
  { label: "Why PHOTON", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Coverage", href: "#coverage" },
  { label: "Pricing", href: "#pricing" },
];

/** Sticky floating pill nav — wordmark, in-page anchors, primary CTA. */
export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(25,25,25,0.72)" : "rgba(25,25,25,0.0)",
          borderColor: scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.0)",
        }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border px-3 py-2 backdrop-blur-xl sm:px-4"
      >
        <a href="#top" className="pl-1.5">
          <PhotonWordmark />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <Pill href="/app/auth" variant="primary" className="px-4 py-2 text-[0.8rem]">
          Open account
        </Pill>
      </motion.nav>
    </div>
  );
}
