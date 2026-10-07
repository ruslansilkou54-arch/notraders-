import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Account, Result, Session, Trade } from "./types";
import { dateISO } from "../utils";

export type Period = "day" | "week" | "month" | "all";

export function tradesForAccount(trades: Trade[], accountId: string | "all") {
  if (accountId === "all") return trades;
  return trades.filter((t) => t.accountId === accountId);
}

export function periodInterval(period: Period, date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (period === "day") return { start: startOfDay(d), end: endOfDay(d) };
  if (period === "week") {
    return {
      start: startOfWeek(d, { weekStartsOn: 1 }),
      end: endOfWeek(d, { weekStartsOn: 1 }),
    };
  }
  if (period === "month") return { start: startOfMonth(d), end: endOfMonth(d) };
  return null;
}

export function tradesInPeriod(trades: Trade[], period: Period, date: Date | string) {
  const interval = periodInterval(period, date);
  if (!interval) return trades;
  return trades.filter((t) => isWithinInterval(new Date(t.openedAt), interval));
}

export type Summary = {
  total: number;
  wins: number;
  losses: number;
  be: number;
  open: number;
  winrate: number;
  profitUsd: number;
  profitPct: number;
  avgRr: number;
  profitFactor: number;
  expectancyR: number;
  bestUsd: number;
  worstUsd: number;
  rSum: number;
};

export function summarize(trades: Trade[], startBalance = 0): Summary {
  const closed = trades.filter((t) => t.result !== "open");
  const wins = closed.filter((t) => t.result === "tp");
  const losses = closed.filter((t) => t.result === "sl");
  const be = closed.filter((t) => t.result === "be");
  const profitUsd = closed.reduce((s, t) => s + t.profitUsd, 0);
  const grossWin = wins.reduce((s, t) => s + Math.max(0, t.profitUsd), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + Math.min(0, t.profitUsd), 0));
  const rSum = closed.reduce((s, t) => s + t.rMultiple, 0);
  const avgRr =
    wins.length === 0 ? 0 : wins.reduce((s, t) => s + t.rr, 0) / wins.length;
  const decided = wins.length + losses.length;
  return {
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    be: be.length,
    open: trades.filter((t) => t.result === "open").length,
    winrate: decided === 0 ? 0 : (wins.length / decided) * 100,
    profitUsd,
    profitPct: startBalance > 0 ? (profitUsd / startBalance) * 100 : 0,
    avgRr,
    profitFactor: grossLoss === 0 ? (grossWin > 0 ? 99 : 0) : grossWin / grossLoss,
    expectancyR: closed.length === 0 ? 0 : rSum / closed.length,
    bestUsd: closed.reduce((m, t) => Math.max(m, t.profitUsd), 0),
    worstUsd: closed.reduce((m, t) => Math.min(m, t.profitUsd), 0),
    rSum,
  };
}

export function accountPnl(trades: Trade[], accountId: string) {
  return trades
    .filter((t) => t.accountId === accountId && t.result !== "open")
    .reduce((s, t) => s + t.profitUsd, 0);
}

export function accountEquity(account: Account, trades: Trade[]) {
  return account.startBalance + accountPnl(trades, account.id);
}

export function targetProgress(account: Account, trades: Trade[]) {
  if (account.profitTargetPct <= 0) return 0;
  const target = account.startBalance * (account.profitTargetPct / 100);
  if (target <= 0) return 0;
  return Math.max(0, (accountPnl(trades, account.id) / target) * 100);
}

export function equitySeries(trades: Trade[], startBalance: number) {
  const closed = [...trades]
    .filter((t) => t.result !== "open")
    .sort((a, b) => +new Date(a.openedAt) - +new Date(b.openedAt));
  let equity = startBalance;
  const points: { t: string; label: string; equity: number; pnl: number }[] = [
    { t: "start", label: "Start", equity, pnl: 0 },
  ];
  for (const trade of closed) {
    equity += trade.profitUsd;
    points.push({
      t: trade.openedAt,
      label: dateISO(trade.openedAt).slice(5),
      equity,
      pnl: trade.profitUsd,
    });
  }
  return points;
}

export function groupBy<K extends string>(trades: Trade[], key: (t: Trade) => K) {
  const map = new Map<K, Trade[]>();
  for (const t of trades) {
    const k = key(t);
    const list = map.get(k);
    if (list) list.push(t);
    else map.set(k, [t]);
  }
  return [...map.entries()].map(([id, list]) => ({ id, list, stats: summarize(list) }));
}

export function bySession(trades: Trade[]) {
  return groupBy(trades, (t) => t.session as Session);
}

export function byPair(trades: Trade[]) {
  return groupBy(trades, (t) => t.pair).sort((a, b) => b.stats.profitUsd - a.stats.profitUsd);
}

export function bySetup(trades: Trade[]) {
  return groupBy(trades, (t) => t.setup || "—").sort(
    (a, b) => b.stats.profitUsd - a.stats.profitUsd,
  );
}

export function byResult(trades: Trade[]) {
  return groupBy(trades, (t) => t.result as Result);
}

export function tradesOnDay(trades: Trade[], isoDay: string) {
  return trades.filter((t) => dateISO(t.openedAt) === isoDay);
}

export function dayDots(trades: Trade[], isoDay: string) {
  const list = tradesOnDay(trades, isoDay);
  const hasTp = list.some((t) => t.result === "tp");
  const hasSl = list.some((t) => t.result === "sl");
  const hasBe = list.some((t) => t.result === "be");
  const hasOpen = list.some((t) => t.result === "open");
  return { count: list.length, hasTp, hasSl, hasBe, hasOpen };
}

export function computeR(result: Result, rr: number) {
  if (result === "tp") return rr;
  if (result === "sl") return -1;
  return 0;
}

export function computePnl(opts: {
  startBalance: number;
  riskPct: number;
  rr: number;
  result: Result;
}) {
  const riskUsd = opts.startBalance * (opts.riskPct / 100);
  const r = computeR(opts.result, opts.rr);
  const profitUsd = Math.round(riskUsd * r * 100) / 100;
  const profitPct =
    opts.startBalance > 0 ? (profitUsd / opts.startBalance) * 100 : 0;
  return { profitUsd, profitPct, rMultiple: r };
}
