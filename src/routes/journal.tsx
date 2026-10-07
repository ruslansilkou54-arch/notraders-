import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthCal } from "@/components/month-cal";
import { PageHeader } from "@/components/page-header";
import { TradeCard } from "@/components/trade-card";
import { Button, Chip, Empty, Sheet } from "@/components/ui";
import { MARKETS, RESULTS, SESSIONS } from "@/lib/journal/constants";
import { formatDayHeading } from "@/lib/journal/format";
import { tradesForAccount, tradesOnDay } from "@/lib/journal/stats";
import { useJournal } from "@/lib/journal/store";
import type { Market, Result, Session } from "@/lib/journal/types";
import { dateISO } from "@/lib/utils";

export const Route = createFileRoute("/journal")({ component: JournalPage });

function JournalPage() {
  const trades = useJournal((s) => s.trades);
  const accounts = useJournal((s) => s.accounts);
  const activeAccountId = useJournal((s) => s.activeAccountId);
  const selectedDate = useJournal((s) => s.selectedDate);
  const setSelectedDate = useJournal((s) => s.setSelectedDate);
  const appearance = useJournal((s) => s.appearance);

  const [month, setMonth] = useState(() => new Date(selectedDate + "T12:00:00"));
  const [mode, setMode] = useState<"cal" | "feed">("cal");
  const [filters, setFilters] = useState(false);
  const [accountId, setAccountId] = useState<string | "all">(activeAccountId);
  const [market, setMarket] = useState<Market | "all">("all");
  const [result, setResult] = useState<Result | "all">("all");
  const [session, setSession] = useState<Session | "all">("all");

  const scoped = useMemo(() => {
    let list = tradesForAccount(trades, accountId);
    if (market !== "all") list = list.filter((t) => t.market === market);
    if (result !== "all") list = list.filter((t) => t.result === result);
    if (session !== "all") list = list.filter((t) => t.session === session);
    return [...list].sort((a, b) => +new Date(b.openedAt) - +new Date(a.openedAt));
  }, [trades, accountId, market, result, session]);

  const dayList = tradesOnDay(scoped, selectedDate);
  const view = appearance.view;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof scoped>();
    for (const t of scoped) {
      const k = dateISO(t.openedAt);
      const arr = map.get(k);
      if (arr) arr.push(t);
      else map.set(k, [t]);
    }
    return [...map.entries()];
  }, [scoped]);

  return (
    <div className="flex flex-col pb-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <PageHeader
        title="Журнал"
        action={
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Фильтры"
              onClick={() => setFilters(true)}
              className="grid size-11 place-items-center rounded-full bg-surface"
            >
              <SlidersHorizontal className="size-4" />
            </button>
            <Link
              to="/trade/new"
              aria-label="Новая сделка"
              className="grid size-11 place-items-center rounded-full bg-accent text-accent-fg"
            >
              <Plus className="size-4" />
            </Link>
          </div>
        }
      />

      <div className="px-5">
        <div className="mb-4 flex rounded-full bg-surface p-1">
          {(
            [
              ["cal", "Календарь"],
              ["feed", "Лента"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={
                mode === id
                  ? "h-8 flex-1 rounded-full bg-accent text-xs font-semibold text-accent-fg"
                  : "h-8 flex-1 rounded-full text-xs font-medium text-muted"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "cal" ? (
          <>
            <MonthCal
              month={month}
              onMonth={setMonth}
              selected={selectedDate}
              onSelect={(iso) => {
                setSelectedDate(iso);
                setMonth(new Date(iso + "T12:00:00"));
              }}
              trades={scoped}
            />
            <h2 className="mt-5 mb-3 text-[15px] font-semibold">
              {formatDayHeading(selectedDate + "T12:00:00")}
            </h2>
            {dayList.length === 0 ? (
              <Empty title="Нет сделок" hint="Выберите другой день или добавьте позицию." />
            ) : (
              <div className="flex flex-col gap-3">
                {dayList.map((t) => (
                  <TradeCard
                    key={t.id}
                    trade={t}
                    compact={view === "list"}
                    minimal={view === "minimal"}
                  />
                ))}
              </div>
            )}
          </>
        ) : grouped.length === 0 ? (
          <Empty title="Журнал пуст" hint="Добавьте первую сделку." />
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(([day, list]) => (
              <section key={day}>
                <h3 className="mb-2 text-xs font-medium text-muted">
                  {formatDayHeading(day + "T12:00:00")}
                </h3>
                <div className="flex flex-col gap-2">
                  {list.map((t) => (
                    <TradeCard
                      key={t.id}
                      trade={t}
                      compact={view !== "cards"}
                      minimal={view === "minimal"}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <Sheet open={filters} onOpenChange={setFilters} title="Фильтры">
        <p className="mb-2 text-xs text-muted">Счёт</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Chip active={accountId === "all"} onClick={() => setAccountId("all")}>
            Все
          </Chip>
          {accounts.map((a) => (
            <Chip key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>
              {a.name}
            </Chip>
          ))}
        </div>
        <p className="mb-2 text-xs text-muted">Рынок</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Chip active={market === "all"} onClick={() => setMarket("all")}>
            Все
          </Chip>
          {MARKETS.map((m) => (
            <Chip key={m.id} active={market === m.id} onClick={() => setMarket(m.id)}>
              {m.label}
            </Chip>
          ))}
        </div>
        <p className="mb-2 text-xs text-muted">Результат</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Chip active={result === "all"} onClick={() => setResult("all")}>
            Все
          </Chip>
          {RESULTS.map((r) => (
            <Chip key={r.id} active={result === r.id} onClick={() => setResult(r.id)}>
              {r.label}
            </Chip>
          ))}
        </div>
        <p className="mb-2 text-xs text-muted">Сессия</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Chip active={session === "all"} onClick={() => setSession("all")}>
            Все
          </Chip>
          {SESSIONS.map((s) => (
            <Chip key={s.id} active={session === s.id} onClick={() => setSession(s.id)}>
              {s.short}
            </Chip>
          ))}
        </div>
        <Button
          variant="muted"
          size="pill"
          onClick={() => {
            setAccountId("all");
            setMarket("all");
            setResult("all");
            setSession("all");
          }}
        >
          Сбросить
        </Button>
      </Sheet>
    </div>
  );
}
