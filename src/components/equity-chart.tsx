import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { equitySeries } from "@/lib/journal/stats";
import type { Trade } from "@/lib/journal/types";
import { money } from "@/lib/journal/format";

export function EquityChart({
  trades,
  startBalance,
}: {
  trades: Trade[];
  startBalance: number;
}) {
  const data = useMemo(
    () => equitySeries(trades, startBalance),
    [trades, startBalance],
  );
  if (data.length < 2) {
    return (
      <div className="grid h-44 place-items-center rounded-[24px] bg-surface text-xs text-muted">
        Нужны закрытые сделки для кривой
      </div>
    );
  }
  return (
    <div className="h-52 rounded-[24px] bg-surface px-2 pt-4 pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v))
            }
          />
          <Tooltip
            contentStyle={{
              background: "#171717",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(v) => {
              const n = typeof v === "number" ? v : Number(v);
              return [money(Number.isFinite(n) ? n : 0), "Equity"];
            }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#eq)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
