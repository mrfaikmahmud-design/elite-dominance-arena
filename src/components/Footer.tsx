import { Link } from "@tanstack/react-router";
import { SdbdLogo } from "./SdbdLogo";
import { Facebook, Youtube, MessageCircle, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-[oklch(0.13_0.04_250)]/60">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <SdbdLogo />
            <p className="text-sm text-muted-foreground">
              Bangladesh's premier solo eFootball tournament platform. Compete, climb the ranks, claim glory.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: MessageCircle, href: "#", label: "Discord" },
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Youtube, href: "#", label: "YouTube" },
                { Icon: Twitter, href: "#", label: "X" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-foreground/80 transition hover:border-[var(--ice)]/50 hover:text-[var(--ice)] hover:shadow-[var(--shadow-glow-ice)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">Compete</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/tournaments" className="hover:text-foreground">Tournaments</Link></li>
              <li><Link to="/fixtures" className="hover:text-foreground">Fixtures</Link></li>
              <li><Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link></li>
              <li><Link to="/hall-of-fame" className="hover:text-foreground">Hall of Fame</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/players" className="hover:text-foreground">Players</Link></li>
              <li><Link to="/news" className="hover:text-foreground">News</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/auth/login" className="hover:text-foreground">Player Login</Link></li>
              <li><Link to="/auth/register" className="hover:text-foreground">Create Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} SDBD — Solo Dominator BD. All rights reserved.</p>
          <p>Crafted for champions in Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  );
}
