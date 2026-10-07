import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { ShareActions } from "@/components/share-actions";
import { TradeForm } from "@/components/trade-form";
import { Button } from "@/components/ui";
import { sessionLabel } from "@/lib/journal/constants";
import { formatDateTime, money, pct, rLabel, rrLabel } from "@/lib/journal/format";
import { useJournal } from "@/lib/journal/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trade/$id")({ component: TradePage });

function TradePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trade = useJournal((s) => s.trades.find((t) => t.id === id));
  const accounts = useJournal((s) => s.accounts);
  const deleteTrade = useJournal((s) => s.deleteTrade);
  const [editing, setEditing] = useState(false);

  if (!trade) {
    return (
      <div className="px-5 pt-10">
        <PageHeader title="Сделка" back />
        <p className="mt-8 text-center text-sm text-muted">Сделка не найдена.</p>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="pt-[max(0.5rem,env(safe-area-inset-top))]">
        <PageHeader title="Редактирование" back />
        <TradeForm trade={trade} />
      </div>
    );
  }

  const account = accounts.find((a) => a.id === trade.accountId);
  const tone =
    trade.result === "tp" ? "text-win" : trade.result === "sl" ? "text-loss" : "text-muted";

  return (
    <div className="flex flex-col gap-5 px-5 pb-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <PageHeader
        title={trade.pair}
        back
        action={
          <button
            type="button"
            aria-label="Изменить"
            className="grid size-11 place-items-center rounded-full bg-surface"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" />
          </button>
        }
      />

      <div className="rounded-[28px] bg-surface p-5">
        <p className="text-xs text-muted">{trade.title}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {trade.side === "long" ? "Long" : "Short"} {trade.pair}
        </p>
        <p className={cn("mt-3 text-2xl font-semibold tabular", tone)}>
          {trade.result === "open" ? "Open" : money(trade.profitUsd)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {trade.result.toUpperCase()} · {rLabel(trade.rMultiple)} · {rrLabel(trade.rr)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Meta k="Открытие" v={formatDateTime(trade.openedAt)} />
        <Meta k="Сессия" v={sessionLabel(trade.session)} />
        <Meta k="Риск" v={`${trade.riskPct}%`} />
        <Meta k="Profit %" v={trade.result === "open" ? "—" : pct(trade.profitPct)} />
        <Meta k="Setup" v={trade.setup || "—"} />
        <Meta k="Счёт" v={account?.name ?? "—"} />
      </dl>

      {trade.context ? (
        <section>
          <h2 className="mb-2 text-xs font-medium text-muted">Context</h2>
          <p className="rounded-[24px] bg-surface px-4 py-3 text-sm leading-relaxed">{trade.context}</p>
        </section>
      ) : null}

      {trade.notes ? (
        <section>
          <h2 className="mb-2 text-xs font-medium text-muted">Заметка</h2>
          <p className="rounded-[24px] bg-surface px-4 py-3 text-sm leading-relaxed">{trade.notes}</p>
        </section>
      ) : null}

      {trade.screenshots.length ? (
        <section>
          <h2 className="mb-2 text-xs font-medium text-muted">Таймфреймы</h2>
          <div className="grid grid-cols-2 gap-2">
            {trade.screenshots.map((s) => (
              <figure key={s.id} className="overflow-hidden rounded-2xl bg-surface-2">
                <img src={s.src} alt={s.timeframe} className="shot h-36 w-full object-cover" />
                <figcaption className="px-2 py-1.5 text-center text-[11px] font-semibold text-muted">
                  {s.timeframe}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-xs font-medium text-muted">Поделиться</h2>
        <ShareActions trade={trade} />
      </section>

      <Button
        variant="danger"
        size="pill"
        onClick={() => {
          if (!confirm("Удалить сделку?")) return;
          deleteTrade(trade.id);
          toast.success("Удалено");
          void navigate({ to: "/journal" });
        }}
      >
        <Trash2 className="size-4" />
        Удалить
      </Button>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-3">
      <dt className="text-[11px] text-muted">{k}</dt>
      <dd className="mt-0.5 text-sm font-semibold">{v}</dd>
    </div>
  );
}
