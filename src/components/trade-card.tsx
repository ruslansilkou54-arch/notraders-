import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { sessionShort } from "@/lib/journal/constants";
import { formatTime, money, rLabel } from "@/lib/journal/format";
import type { Trade } from "@/lib/journal/types";
import { cn } from "@/lib/utils";

const RESULT: Record<Trade["result"], string> = {
  tp: "bg-win/15 text-win",
  sl: "bg-loss/15 text-loss",
  be: "bg-surface-3 text-muted",
  open: "bg-open/15 text-open",
};

export function TradeCard({
  trade,
  compact,
  minimal,
}: {
  trade: Trade;
  compact?: boolean;
  minimal?: boolean;
}) {
  const shots = trade.screenshots.slice(0, 3);
  const extra = trade.screenshots.length - shots.length;

  if (minimal) {
    return (
      <Link
        to="/trade/$id"
        params={{ id: trade.id }}
        className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {trade.pair}{" "}
            <span className="font-medium text-muted">
              {trade.side === "long" ? "L" : "S"}
            </span>
          </p>
          <p className="text-[11px] text-muted">
            {trade.setup || sessionShort(trade.session)}
          </p>
        </div>
        <span
          className={cn(
            "tabular text-sm font-semibold",
            trade.result === "sl"
              ? "text-loss"
              : trade.result === "tp"
                ? "text-win"
                : "text-muted",
          )}
        >
          {trade.result === "open" ? "Open" : rLabel(trade.rMultiple)}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/trade/$id"
      params={{ id: trade.id }}
      className="block rounded-[24px] bg-surface p-4 press"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium text-muted">
          {formatTime(trade.openedAt)} · {sessionShort(trade.session)}
        </p>
        <MoreHorizontal className="size-4 text-faint" />
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-semibold tracking-tight">
            {trade.title || trade.pair}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
              {trade.pair} · {trade.side === "long" ? "Long" : "Short"}
            </span>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", RESULT[trade.result])}>
              {trade.result.toUpperCase()}
            </span>
            {!compact ? (
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                {rLabel(trade.rMultiple)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          {shots.length ? (
            <div className="flex">
              {shots.map((s, i) => (
                <img
                  key={s.id}
                  src={s.src}
                  alt=""
                  className="shot size-9 rounded-full object-cover ring-2 ring-surface"
                  style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}
                />
              ))}
              {extra > 0 ? (
                <span
                  className="grid size-9 place-items-center rounded-full bg-surface-3 text-[10px] font-semibold ring-2 ring-surface"
                  style={{ marginLeft: -10 }}
                >
                  +{extra}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-muted">
              {trade.pair.slice(0, 2)}
            </span>
          )}
        </div>
      </div>
      {!compact && trade.result !== "open" ? (
        <p
          className={cn(
            "mt-3 text-sm font-semibold tabular",
            trade.profitUsd >= 0 ? "text-win" : "text-loss",
          )}
        >
          {money(trade.profitUsd)}
        </p>
      ) : null}
    </Link>
  );
}
