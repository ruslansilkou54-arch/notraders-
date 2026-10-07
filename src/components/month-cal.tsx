import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEKDAYS } from "@/lib/journal/constants";
import { formatMonthTitle } from "@/lib/journal/format";
import { dayDots } from "@/lib/journal/stats";
import type { Trade } from "@/lib/journal/types";
import { cn, todayISO } from "@/lib/utils";

export function MonthCal({
  month,
  onMonth,
  selected,
  onSelect,
  trades,
}: {
  month: Date;
  onMonth: (d: Date) => void;
  selected: string;
  onSelect: (iso: string) => void;
  trades: Trade[];
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const today = todayISO();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-surface"
          onClick={() => onMonth(subMonths(month, 1))}
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-semibold capitalize">{formatMonthTitle(month)}</p>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-surface"
          onClick={() => onMonth(addMonths(month, 1))}
          aria-label="Следующий месяц"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="pb-1 text-[10px] font-medium text-faint">
            {w}
          </span>
        ))}
        {days.map((d) => {
          const iso = todayISO(d);
          const inMonth = isSameMonth(d, month);
          const active = iso === selected;
          const isToday = iso === today;
          const dots = dayDots(trades, iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className="flex flex-col items-center gap-1 py-1"
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-xs font-semibold tabular",
                  active && "bg-accent text-accent-fg",
                  !active && isToday && "shadow-[0_0_0_1px_var(--accent)]",
                  !active && inMonth && "text-fg",
                  !active && !inMonth && "text-faint",
                )}
              >
                {format(d, "d")}
              </span>
              <span className="flex h-1 justify-center gap-0.5">
                {dots.hasTp ? <i className="size-1 rounded-full bg-win" /> : null}
                {dots.hasSl ? <i className="size-1 rounded-full bg-loss" /> : null}
                {dots.hasOpen ? <i className="size-1 rounded-full bg-open" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
