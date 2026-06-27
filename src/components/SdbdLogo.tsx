import { Link } from "@tanstack/react-router";

export function SdbdLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center ${className}`}>
      <span
        className="font-display text-3xl font-black tracking-[0.06em] text-gradient-cyan md:text-4xl"
        style={{
          textShadow:
            "0 0 18px rgba(34,211,238,0.55), 0 0 40px rgba(30,144,255,0.4)",
          WebkitTextStroke: "0.5px rgba(34,211,238,0.4)",
        }}
      >
        SDBD
      </span>
    </Link>
  );
}
