import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/PageTransition";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — SDBD" }] }),
  component: () => (
    <div className="px-6 py-12">
      <Section className="prose prose-invert mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-gradient-gold">Terms of Service</h1>
        <p>By using SDBD you agree to play fair, follow tournament rules, and respect other players. Cheating, account sharing, or harassment results in a permanent ban without refund.</p>
        <h2>Tournaments</h2>
        <p>Entry fees are non-refundable once a bracket is generated. Prizes are paid within 14 days of a verified result.</p>
        <h2>Accounts</h2>
        <p>You are responsible for keeping your credentials safe. One account per person.</p>
        <h2>Disputes</h2>
        <p>All disputes are resolved by SDBD moderators with screenshot/video proof. Decisions are final.</p>
      </Section>
    </div>
  ),
});
