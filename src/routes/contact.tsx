import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/PageTransition";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact SDBD" }, { name: "description", content: "Contact the SDBD team for partnerships, sponsorships, or support." }] }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(1500),
});

function ContactPage() {
  const [pending, setPending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setPending(true);
    // For now, route to email
    window.location.href = `mailto:mrfaikmahmud@gmail.com?subject=SDBD%20contact%20from%20${encodeURIComponent(parsed.data.name)}&body=${encodeURIComponent(parsed.data.message + "\n\nReply to: " + parsed.data.email)}`;
    setTimeout(() => setPending(false), 600);
    toast.success("Opening your email client...");
    (e.currentTarget as HTMLFormElement).reset();
  };
  return (
    <div className="px-6 py-12">
      <Section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--ice)]">Contact</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl"><span className="text-gradient-gold">Let's talk</span></h1>
          <p className="mt-3 text-muted-foreground">Partnerships, sponsorships, press, or player support — send a note and we'll reply soon.</p>
          <form onSubmit={onSubmit} className="glass mt-8 grid gap-4 rounded-2xl p-6">
            <Input name="name" placeholder="Your name" className="border-white/10 bg-white/5" maxLength={80} required />
            <Input name="email" type="email" placeholder="Your email" className="border-white/10 bg-white/5" maxLength={200} required />
            <Textarea name="message" placeholder="How can we help?" rows={6} className="border-white/10 bg-white/5" maxLength={1500} required />
            <Button type="submit" disabled={pending} className="h-11 rounded-xl bg-[var(--gradient-gold)] text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)]">
              Send Message
            </Button>
          </form>
        </div>
        <aside className="space-y-3">
          <div className="glass rounded-2xl p-5">
            <Mail className="mb-2 h-5 w-5 text-[var(--gold)]" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
            <a href="mailto:mrfaikmahmud@gmail.com" className="font-display font-bold">mrfaikmahmud@gmail.com</a>
          </div>
          <div className="glass rounded-2xl p-5">
            <MessageCircle className="mb-2 h-5 w-5 text-[var(--ice)]" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Discord</div>
            <div className="font-display font-bold">SDBD Community</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <MapPin className="mb-2 h-5 w-5 text-[var(--gold)]" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Based in</div>
            <div className="font-display font-bold">Dhaka, Bangladesh 🇧🇩</div>
          </div>
        </aside>
      </Section>
    </div>
  );
}
