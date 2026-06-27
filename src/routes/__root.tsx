import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleField } from "@/components/ParticleField";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass rounded-2xl px-10 py-12 text-center">
        <h1 className="font-display text-7xl font-extrabold text-gradient-gold">404</h1>
        <h2 className="mt-3 text-xl font-semibold">Off the bracket</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This match doesn't exist. Head back to the lobby.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--gold-foreground)] shadow-[var(--shadow-glow-gold)]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-xl font-semibold">Something glitched</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Try again in a moment."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--gradient-gold)] px-4 py-2 text-sm font-semibold text-[var(--gold-foreground)]"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SDBD — Solo Dominator BD | Premium eFootball Tournament Platform" },
      {
        name: "description",
        content:
          "SDBD (Solo Dominator BD) — Bangladesh's ultimate solo eFootball tournament platform. Compete in premium tournaments, climb the rankings, claim the trophy.",
      },
      { name: "theme-color", content: "#08111F" },
      { property: "og:title", content: "SDBD — Solo Dominator BD | Premium eFootball Tournament Platform" },
      {
        property: "og:description",
        content: "Bangladesh's premier eFootball solo tournament platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SDBD — Solo Dominator BD | Premium eFootball Tournament Platform" },
      { name: "description", content: "SDBD is a premium esports platform for eFootball tournaments in Bangladesh." },
      { property: "og:description", content: "SDBD is a premium esports platform for eFootball tournaments in Bangladesh." },
      { name: "twitter:description", content: "SDBD is a premium esports platform for eFootball tournaments in Bangladesh." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0f5f66f9-7b6a-44fa-9187-3f043eae57c0/id-preview-24cb8368--a2ea5677-fe67-4cbd-a07b-002f10c15750.lovable.app-1782541676028.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0f5f66f9-7b6a-44fa-9187-3f043eae57c0/id-preview-24cb8368--a2ea5677-fe67-4cbd-a07b-002f10c15750.lovable.app-1782541676028.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ParticleField />
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster richColors theme="dark" position="top-right" />
    </QueryClientProvider>
  );
}
