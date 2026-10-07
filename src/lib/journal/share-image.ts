import { sessionShort } from "./constants";
import { money, rLabel } from "./format";
import type { Trade } from "./types";

export async function renderShareCard(trade: Trade): Promise<Blob> {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = "#0B0B0B";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#141414";
  roundRect(ctx, 72, 72, w - 144, h - 144, 64);
  ctx.fill();

  ctx.fillStyle = "#C8F542";
  ctx.beginPath();
  ctx.arc(140, 170, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#F4F4F5";
  ctx.font = "600 36px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("notraders", 176, 182);

  const resultColor =
    trade.result === "tp" ? "#C8F542" : trade.result === "sl" ? "#F87171" : "#A1A1AA";

  ctx.fillStyle = "#8B8B8B";
  ctx.font = "500 28px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(
    `${trade.side === "long" ? "LONG" : "SHORT"} · ${sessionShort(trade.session)}`,
    120,
    300,
  );

  ctx.fillStyle = "#F4F4F5";
  ctx.font = "700 120px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(trade.pair, 120, 430);

  ctx.font = "600 44px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(trade.title || trade.setup || "", 120, 500);

  ctx.fillStyle = resultColor;
  ctx.font = "700 96px 'Plus Jakarta Sans', system-ui, sans-serif";
  const pnl =
    trade.result === "open" ? "OPEN" : money(trade.profitUsd);
  ctx.fillText(pnl, 120, 680);

  ctx.fillStyle = "#F4F4F5";
  ctx.font = "600 40px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(
    `${trade.result.toUpperCase()}  ·  ${rLabel(trade.rMultiple)}  ·  RR ${trade.rr}`,
    120,
    760,
  );

  ctx.fillStyle = "#8B8B8B";
  ctx.font = "500 32px 'Plus Jakarta Sans', system-ui, sans-serif";
  wrapText(ctx, trade.context || trade.notes || trade.setup, 120, 860, w - 240, 44);

  ctx.fillStyle = "#C8F542";
  roundRect(ctx, 120, h - 260, 220, 64, 32);
  ctx.fill();
  ctx.fillStyle = "#111111";
  ctx.font = "700 28px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("JOURNAL", 156, h - 218);

  ctx.fillStyle = "#5C5C5C";
  ctx.font = "500 24px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText("notraders", 120, h - 150);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/png");
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineH;
      lines += 1;
      if (lines >= 4) break;
    } else {
      line = test;
    }
  }
  if (line && lines < 4) ctx.fillText(line, x, yy);
}
