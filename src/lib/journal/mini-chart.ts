function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function miniChartSvg(seed: number, bull: boolean) {
  const rnd = mulberry32(seed);
  const w = 360;
  const h = 220;
  const pad = 16;
  const n = 28;
  let price = 50 + rnd() * 20;
  const candles: { x: number; o: number; c: number; h: number; l: number }[] = [];
  const cw = (w - pad * 2) / n;
  for (let i = 0; i < n; i++) {
    const drift = bull ? 0.55 : 0.42;
    const o = price;
    const delta = (rnd() - (1 - drift)) * 8;
    const c = Math.max(8, Math.min(92, o + delta));
    const hi = Math.max(o, c) + rnd() * 4;
    const lo = Math.min(o, c) - rnd() * 4;
    price = c;
    candles.push({ x: pad + i * cw + cw * 0.2, o, c, h: hi, l: lo });
  }

  const y = (p: number) => pad + ((100 - p) / 100) * (h - pad * 2);
  const up = "#C8F542";
  const down = "#F87171";

  const body = candles
    .map((cnd) => {
      const color = cnd.c >= cnd.o ? up : down;
      const top = y(Math.max(cnd.o, cnd.c));
      const bot = y(Math.min(cnd.o, cnd.c));
      const bh = Math.max(2, bot - top);
      const wick = `<line x1="${cnd.x + 3.5}" x2="${cnd.x + 3.5}" y1="${y(cnd.h)}" y2="${y(cnd.l)}" stroke="${color}" stroke-width="1"/>`;
      const bar = `<rect x="${cnd.x}" y="${top}" width="7" height="${bh}" rx="1" fill="${color}"/>`;
      return wick + bar;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="#121212"/>
    <line x1="${pad}" x2="${w - pad}" y1="${h / 2}" y2="${h / 2}" stroke="#ffffff12" />
    ${body}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
