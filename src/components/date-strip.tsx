import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { WEEKDAYS_EN } from "@/lib/journal/constants";
import { dayDots } from "@/lib/journal/stats";
import type { Trade } from "@/lib/journal/types";
import { cn, todayISO } from "@/lib/utils";

export function DateStrip({
  selected,
  onSelect,
  trades,
}: {
  selected: string;
  onSelect: (iso: string) => void;
  trades: Trade[];
}) {
  const selectedDate = new Date(selected + "T12:00:00");
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="flex justify-between gap-1">
      {days.map((d, i) => {
        const iso = todayISO(d);
        const active = isSameDay(d, selectedDate);
        const dots = dayDots(trades, iso);
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[11px] font-medium text-muted">{WEEKDAYS_EN[i]}</span>
            <span
              className={cn(
                "grid size-11 place-items-center rounded-full text-sm font-semibold tabular transition-colors duration-150",
                active ? "bg-accent text-accent-fg" : "bg-surface text-fg",
              )}
            >
              {format(d, "d")}
            </span>
            <span className="flex h-1.5 gap-0.5">
              {dots.hasTp ? <i className="size-1 rounded-full bg-win" /> : null}
              {dots.hasSl ? <i className="size-1 rounded-full bg-loss" /> : null}
              {dots.hasOpen ? <i className="size-1 rounded-full bg-open" /> : null}
              {!dots.count ? <i className="size-1 rounded-full bg-transparent" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
