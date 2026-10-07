import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  Home,
  NotebookPen,
  PieChart,
  User,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ACCENTS } from "@/lib/journal/constants";
import { useJournal } from "@/lib/journal/store";
import { accentFg, cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/journal", label: "Журнал", icon: NotebookPen },
  { to: "/stats", label: "Статистика", icon: PieChart },
  { to: "/plan", label: "План", icon: ClipboardList },
  { to: "/profile", label: "Профиль", icon: User },
] as const;

function applyAppearance(hex: string, density: string, iconSet: string) {
  const root = document.documentElement;
  root.style.setProperty("--accent", hex);
  root.style.setProperty("--accent-fg", accentFg(hex));
  root.style.setProperty("--win", hex.toLowerCase() === "#c8f542" ? "#c8f542" : hex);
  root.dataset.density = density;
  root.dataset.icons = iconSet;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const appearance = useJournal((s) => s.appearance);
  const setHydrated = useJournal((s) => s.setHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const finish = () => {
      setHydrated(true);
      setReady(true);
    };
    if (useJournal.persist.hasHydrated()) {
      finish();
    } else {
      unsub = useJournal.persist.onFinishHydration(finish);
      void useJournal.persist.rehydrate();
    }
    return () => {
      unsub?.();
    };
  }, [setHydrated]);

  useEffect(() => {
    applyAppearance(appearance.accentHex, appearance.density, appearance.iconSet);
  }, [appearance]);

  const hideChrome = pathname.startsWith("/share") || pathname.startsWith("/trade");
  const stroke = appearance.iconSet === "thin" ? 1.4 : appearance.iconSet === "sharp" ? 2.25 : 1.8;

  return (
    <div className="grain flex min-h-dvh justify-center bg-stage md:items-center md:py-6">
      <div className="flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bg md:h-[min(844px,calc(100dvh-48px))] md:rounded-[40px] md:phone-shadow">
        {!ready ? (
          <Splash />
        ) : (
          <>
            <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
            {!hideChrome ? (
              <nav className="z-20 shrink-0 bg-bg px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <ul className="flex items-center justify-between">
                  {NAV.map((item) => {
                    const active =
                      item.to === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.to);
                    const Icon = item.icon;
                    const filled = active && item.to === "/" && appearance.iconSet !== "thin";
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          aria-label={item.label}
                          className={cn(
                            "grid size-12 place-items-center rounded-full transition-colors duration-150",
                            active ? "bg-accent text-accent-fg" : "text-muted",
                          )}
                        >
                          <Icon
                            className="size-5"
                            strokeWidth={stroke}
                            fill={filled ? "currentColor" : "none"}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}
          </>
        )}
      </div>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "!bg-surface !text-fg !border-white/10 !rounded-2xl",
        }}
      />
    </div>
  );
}

function Splash() {
  const hex = ACCENTS[0].hex;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div
        className="grid size-14 place-items-center rounded-full"
        style={{ background: hex, color: "#111" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 18V8M7 8l3-3M7 8L4 5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M17 6v10M17 16l3 3M17 16l-3 3"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold tracking-tight">notraders</p>
    </div>
  );
}
