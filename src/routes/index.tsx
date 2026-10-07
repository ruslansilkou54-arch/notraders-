import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DateStrip } from "@/components/date-strip";
import { TradeCard } from "@/components/trade-card";
import { Avatar, Button, Empty, Sheet } from "@/components/ui";
import { formatTime } from "@/lib/journal/format";
import { accountEquity, targetProgress, tradesOnDay } from "@/lib/journal/stats";
import { useJournal } from "@/lib/journal/store";
import { greeting } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const profile = useJournal((s) => s.profile);
  const selectedDate = useJournal((s) => s.selectedDate);
  const setSelectedDate = useJournal((s) => s.setSelectedDate);
  const trades = useJournal((s) => s.trades);
  const accounts = useJournal((s) => s.accounts);
  const activeAccountId = useJournal((s) => s.activeAccountId);
  const appearance = useJournal((s) => s.appearance);
  const plans = useJournal((s) => s.plans);
  const [bell, setBell] = useState(false);

  const account = accounts.find((a) => a.id === activeAccountId) ?? accounts[0];
  const todayTrades = useMemo(
    () =>
      tradesOnDay(trades, selectedDate).sort(
        (a, b) => +new Date(a.openedAt) - +new Date(b.openedAt),
      ),
    [trades, selectedDate],
  );
  const progress = account ? targetProgress(account, trades) : 0;
  const equity = account ? accountEquity(account, trades) : 0;
  const monthTrades = trades.filter((t) => t.accountId === account?.id);
  const openCount = monthTrades.filter((t) => t.result === "open").length;
  const view = appearance.view;

  const recent = trades.slice(0, 5);
  const dayPlan = plans.find((p) => p.period === "day");

  return (
    <div className="flex flex-col gap-5 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] stagger-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={profile.name} src={profile.avatarSrc} />
          <div>
            <p className="text-[17px] font-semibold tracking-tight">Hi, {profile.name}</p>
            <p className="text-xs text-muted">{greeting()}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Уведомления"
          onClick={() => setBell(true)}
          className="grid size-11 place-items-center rounded-full bg-surface text-fg"
        >
          <Bell className="size-5" />
        </button>
      </header>

      <Link to="/trade/new">
        <Button size="pill" variant="surface" className="justify-between font-medium text-muted">
          <span>Добавить сделку</span>
          <Plus className="size-5" />
        </Button>
      </Link>

      <DateStrip selected={selectedDate} onSelect={setSelectedDate} trades={trades} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Сделки сегодня</h2>
          <Link to="/journal" className="text-xs font-medium text-muted">
            Журнал
          </Link>
        </div>
        {todayTrades.length === 0 ? (
          <Empty
            title="Тихий день"
            hint="Первая сделка за выбранную дату — в один тап."
            action={
              <Link to="/trade/new" className="mt-2">
                <Button size="sm">Открыть форму</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {todayTrades.map((t) => (
              <TradeCard
                key={t.id}
                trade={t}
                compact={view === "list"}
                minimal={view === "minimal"}
              />
            ))}
          </div>
        )}
      </section>

      {account ? (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Активный счёт</h2>
          <Link
            to="/profile"
            className="block rounded-[24px] bg-surface p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted">{account.firm}</p>
                <p className="text-[17px] font-semibold">{account.name}</p>
              </div>
              <span className="text-[11px] font-medium text-muted">
                {openCount} open
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                {account.type}
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                {monthTrades.length} trades
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium tabular text-muted">
                {equity.toLocaleString("en-US", { maximumFractionDigits: 0 })} {account.currency}
              </span>
            </div>
            {account.profitTargetPct > 0 ? (
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px] text-muted">
                  <span>До цели {account.profitTargetPct}%</span>
                  <span className="tabular">{Math.round(progress)}%</span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                  <span
                    className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-accent"
                    style={{ left: `calc(${Math.min(100, progress)}% - 6px)` }}
                  />
                </div>
              </div>
            ) : null}
          </Link>
        </section>
      ) : null}

      <Sheet open={bell} onOpenChange={setBell} title="Активность">
        {dayPlan ? (
          <div className="mb-4 rounded-2xl bg-surface-2 p-3">
            <p className="text-xs font-medium text-muted">План на день</p>
            <p className="mt-1 text-sm font-semibold">{dayPlan.bias}</p>
            <p className="mt-1 text-xs text-muted">
              Макс. {dayPlan.maxTrades} сделок · риск {dayPlan.maxRiskPct}%
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          {recent.map((t) => (
            <Link
              key={t.id}
              to="/trade/$id"
              params={{ id: t.id }}
              className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-3"
              onClick={() => setBell(false)}
            >
              <div>
                <p className="text-sm font-semibold">
                  {t.pair} · {t.result.toUpperCase()}
                </p>
                <p className="text-[11px] text-muted">{formatTime(t.openedAt)}</p>
              </div>
              <span className="text-xs font-medium text-muted">{t.setup}</span>
            </Link>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
