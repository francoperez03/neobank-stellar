import { Section } from "./section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const TEAM = [
  { name: "Alexis Jankovski", role: "Operations" },
  { name: "Sebastián Luján", role: "Technology" },
  { name: "Franco Pérez", role: "Product" },
];

export function Team() {
  return (
    <Section id="team">
      <Reveal>
        <Eyebrow>Team</Eyebrow>
        <h2 className="mt-5 max-w-xl text-balance font-display text-h2 font-medium leading-[1.08] tracking-[-0.02em] text-ink">
          The team behind PHOTON.
        </h2>
      </Reveal>

      <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-3">
        {TEAM.map((m) => (
          <RevealItem
            key={m.name}
            className="rounded-2xl bg-surface/40 p-6 ring-1 ring-hairline"
          >
            <h3 className="font-display text-lg font-medium text-ink">{m.name}</h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
              {m.role}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
