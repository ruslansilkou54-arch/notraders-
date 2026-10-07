import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MARKETS,
  PAIRS,
  RESULTS,
  SESSIONS,
  SETUPS,
  TIMEFRAMES,
  marketOf,
} from "@/lib/journal/constants";
import { compressImage } from "@/lib/journal/images";
import { computePnl } from "@/lib/journal/stats";
import { useJournal } from "@/lib/journal/store";
import type { Market, Result, Session, Side, Timeframe, Trade, TradeShot } from "@/lib/journal/types";
import {
  fromLocalDateTimeValue,
  toLocalDateTimeValue,
  uid,
} from "@/lib/utils";
import { Button, Chip, Field, Input, Segmented, Textarea } from "./ui";

export function TradeForm({ trade }: { trade?: Trade }) {
  const navigate = useNavigate();
  const accounts = useJournal((s) => s.accounts);
  const activeAccountId = useJournal((s) => s.activeAccountId);
  const selectedDate = useJournal((s) => s.selectedDate);
  const addTrade = useJournal((s) => s.addTrade);
  const updateTrade = useJournal((s) => s.updateTrade);

  const [accountId, setAccountId] = useState(trade?.accountId ?? activeAccountId);
  const [pair, setPair] = useState(trade?.pair ?? "NQ");
  const [market, setMarket] = useState<Market>(trade?.market ?? "indices");
  const [side, setSide] = useState<Side>(trade?.side ?? "long");
  const [openedAt, setOpenedAt] = useState(() => {
    if (trade) return toLocalDateTimeValue(trade.openedAt);
    const base = new Date(selectedDate + "T12:00:00");
    const now = new Date();
    base.setHours(now.getHours(), now.getMinutes(), 0, 0);
    return toLocalDateTimeValue(base.toISOString());
  });
  const [session, setSession] = useState<Session>(trade?.session ?? "ny_am");
  const [riskPct, setRiskPct] = useState(String(trade?.riskPct ?? 0.5));
  const [rr, setRr] = useState(String(trade?.rr ?? 2));
  const [result, setResult] = useState<Result>(trade?.result ?? "tp");
  const [title, setTitle] = useState(trade?.title ?? "");
  const [setup, setSetup] = useState(trade?.setup ?? "Silver Bullet");
  const [context, setContext] = useState(trade?.context ?? "");
  const [notes, setNotes] = useState(trade?.notes ?? "");
  const [shots, setShots] = useState<TradeShot[]>(trade?.screenshots ?? []);
  const [manualPnl, setManualPnl] = useState(false);
  const [profitUsd, setProfitUsd] = useState(String(trade?.profitUsd ?? 0));
  const [profitPct, setProfitPct] = useState(String(trade?.profitPct ?? 0));

  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];

  const auto = useMemo(() => {
    if (!account) return { profitUsd: 0, profitPct: 0, rMultiple: 0 };
    return computePnl({
      startBalance: account.startBalance,
      riskPct: Number(riskPct) || 0,
      rr: Number(rr) || 0,
      result,
    });
  }, [account, riskPct, rr, result]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    try {
      const next: TradeShot[] = [];
      for (const file of Array.from(files)) {
        const src = await compressImage(file);
        next.push({
          id: uid(),
          src,
          timeframe: nextTf(shots.length + next.length),
        });
      }
      setShots((s) => [...s, ...next].slice(0, 6));
    } catch {
      toast.error("Не удалось добавить скрин");
    }
  }

  function save() {
    if (!account) return;
    const pnl = manualPnl
      ? {
          profitUsd: Number(profitUsd) || 0,
          profitPct: Number(profitPct) || 0,
          rMultiple: auto.rMultiple,
        }
      : auto;
    const payload = {
      accountId: account.id,
      title: title.trim() || `${pair} ${setup}`,
      pair,
      market,
      side,
      openedAt: fromLocalDateTimeValue(openedAt),
      session,
      riskPct: Number(riskPct) || 0,
      rr: Number(rr) || 0,
      result,
      context: context.trim(),
      setup: setup.trim(),
      notes: notes.trim(),
      screenshots: shots,
      ...pnl,
    };
    if (trade) {
      updateTrade(trade.id, payload);
      toast.success("Сделка обновлена");
      void navigate({ to: "/trade/$id", params: { id: trade.id } });
    } else {
      const id = addTrade(payload);
      toast.success("Сделка в журнале");
      void navigate({ to: "/trade/$id", params: { id } });
    }
  }

  return (
    <form
      className="flex flex-col gap-5 px-5 pb-8"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Field label="Счёт">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {accounts.map((a) => (
            <Chip key={a.id} active={a.id === accountId} onClick={() => setAccountId(a.id)}>
              {a.name}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Рынок">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MARKETS.map((m) => (
            <Chip
              key={m.id}
              active={market === m.id}
              onClick={() => {
                setMarket(m.id);
                const first = PAIRS[m.id][0];
                if (first) setPair(first);
              }}
            >
              {m.label}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-4 gap-2">
        {PAIRS[market].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPair(p);
              setMarket(marketOf(p));
            }}
            className={
              pair === p
                ? "h-10 rounded-2xl bg-accent text-xs font-semibold text-accent-fg"
                : "h-10 rounded-2xl bg-surface-2 text-xs font-medium text-muted"
            }
          >
            {p}
          </button>
        ))}
      </div>

      <Segmented
        value={side}
        onChange={setSide}
        options={[
          { id: "long" as const, label: "Long" },
          { id: "short" as const, label: "Short" },
        ]}
      />

      <Field label="Название">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="NQ Open Drive" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Дата и время">
          <Input
            type="datetime-local"
            value={openedAt}
            onChange={(e) => setOpenedAt(e.target.value)}
          />
        </Field>
        <Field label="Сессия">
          <div className="flex flex-wrap gap-1.5">
            {SESSIONS.map((s) => (
              <Chip key={s.id} active={session === s.id} onClick={() => setSession(s.id)}>
                {s.short}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Риск %">
          <Input
            inputMode="decimal"
            value={riskPct}
            onChange={(e) => setRiskPct(e.target.value)}
          />
        </Field>
        <Field label="RR (цель)">
          <Input inputMode="decimal" value={rr} onChange={(e) => setRr(e.target.value)} />
        </Field>
      </div>

      <Field label="Result">
        <div className="grid grid-cols-4 gap-2">
          {RESULTS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setResult(r.id)}
              className={
                result === r.id
                  ? r.id === "tp"
                    ? "h-10 rounded-2xl bg-win text-xs font-semibold text-accent-fg"
                    : r.id === "sl"
                      ? "h-10 rounded-2xl bg-loss text-xs font-semibold text-fg"
                      : "h-10 rounded-2xl bg-accent text-xs font-semibold text-accent-fg"
                  : "h-10 rounded-2xl bg-surface-2 text-xs font-medium text-muted"
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="rounded-[24px] bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-muted">Profit</p>
          <button
            type="button"
            className="text-xs font-medium text-accent"
            onClick={() => {
              setManualPnl((v) => !v);
              if (!manualPnl) {
                setProfitUsd(String(auto.profitUsd));
                setProfitPct(String(auto.profitPct.toFixed(2)));
              }
            }}
          >
            {manualPnl ? "Авто" : "Вручную"}
          </button>
        </div>
        {manualPnl ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Profit $">
              <Input value={profitUsd} onChange={(e) => setProfitUsd(e.target.value)} />
            </Field>
            <Field label="Profit %">
              <Input value={profitPct} onChange={(e) => setProfitPct(e.target.value)} />
            </Field>
          </div>
        ) : (
          <p className="text-lg font-semibold tabular">
            {auto.profitUsd >= 0 ? "+" : "−"}${Math.abs(auto.profitUsd).toFixed(2)}
            <span className="ml-2 text-sm font-medium text-muted">
              {auto.rMultiple}R
            </span>
          </p>
        )}
      </div>

      <Field label="Setup">
        <div className="flex flex-wrap gap-1.5">
          {SETUPS.map((s) => (
            <Chip key={s} active={setup === s} onClick={() => setSetup(s)}>
              {s}
            </Chip>
          ))}
        </div>
        <Input
          className="mt-2"
          value={setup}
          onChange={(e) => setSetup(e.target.value)}
          placeholder="Свой сетап"
        />
      </Field>

      <Field label="Context">
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="HTF bias, уровень, новости…"
        />
      </Field>

      <Field
        label="Скрины таймфреймов"
        hint="Два и больше разных ТФ — так разбор читается"
      >
        <div className="grid grid-cols-2 gap-2">
          {shots.map((s) => (
            <div key={s.id} className="relative overflow-hidden rounded-2xl bg-surface-2">
              <img src={s.src} alt="" className="shot h-28 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-bg/65 px-2 py-1">
                <select
                  value={s.timeframe}
                  onChange={(e) =>
                    setShots((all) =>
                      all.map((x) =>
                        x.id === s.id ? { ...x, timeframe: e.target.value as Timeframe } : x,
                      ),
                    )
                  }
                  className="bg-transparent text-[11px] font-semibold"
                >
                  {TIMEFRAMES.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="Удалить скрин"
                  onClick={() => setShots((all) => all.filter((x) => x.id !== s.id))}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {shots.length < 6 ? (
            <label className="grid h-28 place-items-center rounded-2xl bg-surface-2 text-muted">
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="size-5" />
                Добавить
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void onFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
        </div>
      </Field>

      <Field label="Заметка">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Что сработало, что сломать в следующий раз"
        />
      </Field>

      <Button type="submit" size="pill">
        {trade ? "Сохранить" : "Добавить сделку"}
      </Button>
    </form>
  );
}

function nextTf(i: number): Timeframe {
  const order: Timeframe[] = ["M5", "M15", "H1", "H4"];
  return order[i] ?? "M15";
}
