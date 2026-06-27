import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/PageTransition";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — SDBD" }] }),
  component: () => (
    <div className="px-6 py-12">
      <Section className="prose prose-invert mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-gradient-gold">Privacy Policy</h1>
        <p>SDBD respects your privacy. We collect only the information needed to operate the platform: your account email, username, profile fields you provide, and match results.</p>
        <h2>What we collect</h2>
        <ul><li>Account: email, username, password hash, optional profile fields.</li><li>Gameplay: tournament registrations, matches, ratings, screenshots.</li><li>Technical: standard server logs and analytics.</li></ul>
        <h2>How we use it</h2>
        <p>To run tournaments, calculate rankings, display public profiles and leaderboards, and contact you about your registrations.</p>
        <h2>Your rights</h2>
        <p>You can edit your profile, request data export, or delete your account at any time by contacting <a href="mailto:mrfaikmahmud@gmail.com">mrfaikmahmud@gmail.com</a>.</p>
      </Section>
    </div>
  ),
});
