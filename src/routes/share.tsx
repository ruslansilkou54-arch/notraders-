import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { sessionLabel } from "@/lib/journal/constants";
import { formatDateTime, money, rLabel } from "@/lib/journal/format";
import { decodeTradeShare } from "@/lib/journal/share";
import { useJournal } from "@/lib/journal/store";
import { uid } from "@/lib/utils";

type Search = { t?: string };

export const Route = createFileRoute("/share")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    t: typeof s.t === "string" ? s.t : undefined,
  }),
  component: SharePage,
});

function SharePage() {
  const { t } = Route.useSearch();
  const trade = useMemo(() => (t ? decodeTradeShare(t) : null), [t]);
  const addTrade = useJournal((s) => s.addTrade);
  const accounts = useJournal((s) => s.accounts);
  const activeAccountId = useJournal((s) => s.activeAccountId);

  if (!trade) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold">Ссылка повреждена</p>
        <p className="text-xs text-muted">Попросите трейдера отправить сделку ещё раз.</p>
        <Link to="/">
          <Button size="sm">На главную</Button>
        </Link>
      </div>
    );
  }

  const tone =
    trade.result === "tp" ? "text-win" : trade.result === "sl" ? "text-loss" : "text-muted";

  return (
    <div className="flex flex-col gap-5 px-5 py-8">
      <p className="text-xs font-medium text-muted">notraders</p>
      <div className="rounded-[28px] bg-surface p-5">
        <p className="text-xs text-muted">
          {trade.side === "long" ? "LONG" : "SHORT"} · {sessionLabel(trade.session)}
        </p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">{trade.pair}</h1>
        <p className="mt-1 text-sm text-muted">{trade.title || trade.setup}</p>
        <p className={`mt-5 text-3xl font-semibold tabular ${tone}`}>
          {trade.result === "open" ? "OPEN" : money(trade.profitUsd)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {trade.result.toUpperCase()} · {rLabel(trade.rMultiple)}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-muted">
        {trade.context || trade.notes || formatDateTime(trade.openedAt)}
      </p>
      <Button
        size="pill"
        onClick={() => {
          const accountId = activeAccountId || accounts[0]?.id || uid();
          addTrade({ ...trade, accountId, screenshots: [] });
          toast.success("Сделка добавлена в ваш журнал");
        }}
      >
        Добавить к себе
      </Button>
      <Link to="/" className="text-center text-xs text-muted">
        Открыть notraders
      </Link>
    </div>
  );
}
