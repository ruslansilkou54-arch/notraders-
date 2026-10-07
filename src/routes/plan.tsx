import { createFileRoute } from "@tanstack/react-router";
import { startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button, Chip, Field, Input, Textarea } from "@/components/ui";
import { ALL_PAIRS } from "@/lib/journal/constants";
import { useJournal } from "@/lib/journal/store";
import type { Plan, PlanPeriod } from "@/lib/journal/types";
import { todayISO } from "@/lib/utils";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  const [period, setPeriod] = useState<PlanPeriod>("day");
  const date = useMemo(() => {
    if (period === "day") return todayISO();
    return todayISO(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, [period]);
  const existing = useJournal((s) =>
    s.plans.find((p) => p.period === period && p.date === date),
  );

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <PageHeader title="Торговый план" />
      <div className="flex rounded-full bg-surface p-1">
        {(
          [
            ["day", "День"],
            ["week", "Неделя"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={
              period === id
                ? "h-8 flex-1 rounded-full bg-accent text-xs font-semibold text-accent-fg"
                : "h-8 flex-1 rounded-full text-xs font-medium text-muted"
            }
          >
            {label}
          </button>
        ))}
      </div>
      <PlanEditor
        key={`${period}-${date}-${existing?.id ?? "new"}`}
        period={period}
        date={date}
        existing={existing}
      />
    </div>
  );
}

function PlanEditor({
  period,
  date,
  existing,
}: {
  period: PlanPeriod;
  date: string;
  existing?: Plan;
}) {
  const upsertPlan = useJournal((s) => s.upsertPlan);
  const [bias, setBias] = useState(existing?.bias ?? "");
  const [focus, setFocus] = useState<string[]>(existing?.focusPairs ?? ["NQ"]);
  const [maxTrades, setMaxTrades] = useState(String(existing?.maxTrades ?? 2));
  const [maxRisk, setMaxRisk] = useState(String(existing?.maxRiskPct ?? 1));
  const [rulesText, setRulesText] = useState((existing?.rules ?? []).join("\n"));
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function togglePair(p: string) {
    setFocus((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  function save() {
    upsertPlan({
      id: existing?.id,
      period,
      date,
      bias: bias.trim(),
      focusPairs: focus,
      maxTrades: Number(maxTrades) || 0,
      maxRiskPct: Number(maxRisk) || 0,
      rules: rulesText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      notes: notes.trim(),
    });
    toast.success(period === "day" ? "План дня сохранён" : "План недели сохранён");
  }

  return (
    <>
      <Field label="Bias">
        <Input
          value={bias}
          onChange={(e) => setBias(e.target.value)}
          placeholder="Bullish NQ, gold range"
        />
      </Field>
      <Field label="Фокус пары">
        <div className="flex flex-wrap gap-1.5">
          {ALL_PAIRS.map((p) => (
            <Chip key={p} active={focus.includes(p)} onClick={() => togglePair(p)}>
              {p}
            </Chip>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Макс. сделок">
          <Input
            inputMode="numeric"
            value={maxTrades}
            onChange={(e) => setMaxTrades(e.target.value)}
          />
        </Field>
        <Field label="Макс. риск %">
          <Input
            inputMode="decimal"
            value={maxRisk}
            onChange={(e) => setMaxRisk(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Правила" hint="Каждое правило с новой строки">
        <Textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          placeholder={"Только NY AM\nНет новостей за 20 мин"}
          className="min-h-32"
        />
      </Field>
      <Field label="Заметка">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {existing?.rules.length ? (
        <ul className="flex flex-col gap-2">
          {existing.rules.map((r) => (
            <li key={r} className="rounded-2xl bg-surface px-4 py-3 text-sm">
              {r}
            </li>
          ))}
        </ul>
      ) : null}
      <Button size="pill" onClick={save}>
        Сохранить план
      </Button>
    </>
  );
}
