import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export function money(n: number, currency = "USD") {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: abs >= 100 && Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const prefix = currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;
  return `${sign}${prefix}${formatted}`;
}

export function pct(n: number, digits = 1) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

export function rrLabel(n: number) {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `1:${v}`;
}

export function rLabel(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n);
  const v = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return `${sign}${v}R`;
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return format(d, "H:mm");
}

export function formatDayHeading(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Сегодня";
  if (isYesterday(d)) return "Вчера";
  return format(d, "d MMMM", { locale: ru });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return format(d, "d MMM, HH:mm", { locale: ru });
}

export function formatMonthTitle(d: Date) {
  return format(d, "LLLL yyyy", { locale: ru });
}

export function winrate(wins: number, losses: number) {
  const closed = wins + losses;
  if (closed === 0) return 0;
  return (wins / closed) * 100;
}
