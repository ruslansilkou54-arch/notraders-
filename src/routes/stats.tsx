import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EquityChart } from "@/components/equity-chart";
import { PageHeader } from "@/components/page-header";
import { Chip } from "@/components/ui";
import { sessionShort } from "@/lib/journal/constants";
import { money, pct } from "@/lib/journal/format";
import {
  byPair,
  bySession,
  bySetup,
  summarize,
  tradesForAccount,
  tradesInPeriod,
  type Period,
} from "@/lib/journal/stats";
import { useJournal } from "@/lib/journal/store";
import type { Session } from "@/lib/journal/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const trades = useJournal((s) => s.trades);
  const accounts = useJournal((s) => s.accounts);
  const activeAccountId = useJournal((s) => s.activeAccountId);
  const selectedDate = useJournal((s) => s.selectedDate);

  const [period, setPeriod] = useState<Period>("all");
  const [accountId, setAccountId] = useState<string | "all">("all");

  const account = accounts.find((a) => a.id === accountId);
  const startBalance =
    accountId === "all"
      ? accounts.reduce((s, a) => s + a.startBalance, 0)
      : (account?.startBalance ?? 0);

  const scoped = useMemo(() => {
    const base = tradesForAccount(trades, accountId);
    return tradesInPeriod(base, period, new Date());
  }, [trades, accountId, period, selectedDate]);

  const allForCurve = useMemo(
    () => tradesForAccount(trades, accountId),
    [trades, accountId],
  );

  const s = summarize(scoped, startBalance);
  const sessions = bySession(scoped);
  const pairs = byPair(scoped).slice(0, 6);
  const setups = bySetup(scoped).slice(0, 5);

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <PageHeader title="Статистика" />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {(
          [
            ["day", "День"],
            ["week", "Неделя"],
            ["month", "Месяц"],
            ["all", "Всё"],
          ] as const
        ).map(([id, label]) => (
          <Chip key={id} active={period === id} onClick={() => setPeriod(id)}>
            {label}
          </Chip>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <Chip active={accountId === "all"} onClick={() => setAccountId("all")}>
          Все счета
        </Chip>
        {accounts.map((a) => (
          <Chip key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>
            {a.name}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Net" value={money(s.profitUsd)} tone={s.profitUsd >= 0 ? "win" : "loss"} />
        <Stat label="Winrate" value={`${s.winrate.toFixed(0)}%`} />
        <Stat label="Profit factor" value={s.profitFactor >= 99 ? "∞" : s.profitFactor.toFixed(2)} />
        <Stat label="Expectancy" value={`${s.expectancyR >= 0 ? "+" : ""}${s.expectancyR.toFixed(2)}R`} />
        <Stat label="Сделок" value={String(s.total)} />
        <Stat label="Avg RR" value={s.avgRr.toFixed(1)} />
      </div>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Кривая капитала</h2>
        <EquityChart trades={allForCurve} startBalance={startBalance} />
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Сессии</h2>
        <div className="flex flex-col gap-2">
          {sessions.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
            >
              <span className="text-sm font-medium">{sessionShort(row.id as Session)}</span>
              <span className="flex items-center gap-3 text-xs tabular text-muted">
                <span>{row.stats.total}</span>
                <span className={row.stats.profitUsd >= 0 ? "text-win" : "text-loss"}>
                  {money(row.stats.profitUsd)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Пары</h2>
        <div className="flex flex-col gap-2">
          {pairs.map((row) => (
            <BarRow
              key={row.id}
              label={row.id}
              value={row.stats.profitUsd}
              max={Math.max(...pairs.map((p) => Math.abs(p.stats.profitUsd)), 1)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Сетапы</h2>
        <div className="flex flex-col gap-2">
          {setups.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
            >
              <span className="text-sm font-medium">{row.id}</span>
              <span className="text-xs tabular text-muted">
                {row.stats.wins}/{row.stats.total} · {pct(row.stats.winrate, 0)} WR
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "win" | "loss";
}) {
  return (
    <div className="rounded-[24px] bg-surface px-4 py-3">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular tracking-tight",
          tone === "win" && "text-win",
          tone === "loss" && "text-loss",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const w = Math.max(6, (Math.abs(value) / max) * 100);
  return (
    <div className="rounded-2xl bg-surface px-4 py-3">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("tabular text-xs", value >= 0 ? "text-win" : "text-loss")}>
          {money(value)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className={cn("h-full rounded-full", value >= 0 ? "bg-win" : "bg-loss")}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}
