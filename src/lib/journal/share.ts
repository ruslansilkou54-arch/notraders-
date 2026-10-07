import type { Trade } from "./types";

type SharePayload = Omit<Trade, "screenshots"> & { screenshots?: never };

function bytesToBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeTradeShare(trade: Trade) {
  const slim: SharePayload = {
    id: trade.id,
    accountId: trade.accountId,
    title: trade.title,
    pair: trade.pair,
    market: trade.market,
    side: trade.side,
    openedAt: trade.openedAt,
    session: trade.session,
    riskPct: trade.riskPct,
    rr: trade.rr,
    result: trade.result,
    context: trade.context,
    setup: trade.setup,
    profitPct: trade.profitPct,
    profitUsd: trade.profitUsd,
    rMultiple: trade.rMultiple,
    notes: trade.notes,
    createdAt: trade.createdAt,
  };
  const json = JSON.stringify(slim);
  return bytesToBase64Url(new TextEncoder().encode(json));
}

export function decodeTradeShare(payload: string): Trade | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(payload));
    const data = JSON.parse(json) as SharePayload;
    if (!data || typeof data !== "object" || !data.pair || !data.openedAt) return null;
    return { ...data, screenshots: [] };
  } catch {
    return null;
  }
}

export function tradeSummaryText(trade: Trade) {
  const side = trade.side === "long" ? "LONG" : "SHORT";
  const res = trade.result.toUpperCase();
  const pnl =
    trade.result === "open"
      ? "OPEN"
      : `${trade.profitUsd >= 0 ? "+" : ""}${trade.profitUsd.toFixed(2)} USD · ${trade.rMultiple}R`;
  const lines = [
    `notraders · ${trade.pair} ${side}`,
    `${res}  ${pnl}`,
    `RR ${trade.rr} · risk ${trade.riskPct}% · ${trade.setup || "—"}`,
    trade.context,
    trade.notes,
  ].filter(Boolean);
  return lines.join("\n");
}

export function shareUrl(payload: string) {
  if (typeof window === "undefined") return `/share?t=${payload}`;
  return `${window.location.origin}/share?t=${encodeURIComponent(payload)}`;
}
