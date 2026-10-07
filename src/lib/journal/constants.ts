import type {
  AccountType,
  Appearance,
  IconSet,
  Market,
  Result,
  Session,
  Timeframe,
  ViewMode,
} from "./types";

export const APP_NAME = "notraders";

export const ACCENTS = [
  { id: "lime", hex: "#C8F542", name: "Lime" },
  { id: "mint", hex: "#3EE0B7", name: "Mint" },
  { id: "sky", hex: "#7DD3FC", name: "Sky" },
  { id: "sand", hex: "#E4D2A8", name: "Sand" },
  { id: "ivory", hex: "#F4F1EA", name: "Ivory" },
] as const;

export const DEFAULT_APPEARANCE: Appearance = {
  accentHex: "#C8F542",
  density: "comfortable",
  view: "cards",
  iconSet: "rounded",
};

export const MARKETS: { id: Market; label: string }[] = [
  { id: "indices", label: "Indices" },
  { id: "forex", label: "Forex" },
  { id: "metals", label: "Metals" },
  { id: "crypto", label: "Crypto" },
];

export const PAIRS: Record<Market, string[]> = {
  indices: ["NQ", "ES", "YM", "RTY", "GER40", "US30", "UK100", "JP225"],
  forex: [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "AUDUSD",
    "USDCAD",
    "NZDUSD",
    "EURGBP",
    "EURJPY",
    "GBPJPY",
  ],
  metals: ["XAUUSD", "XAGUSD"],
  crypto: ["BTCUSD", "ETHUSD", "SOLUSD"],
};

export const ALL_PAIRS = (Object.values(PAIRS) as string[][]).flat();

export const SESSIONS: { id: Session; label: string; short: string }[] = [
  { id: "ny_am", label: "New York AM", short: "NY AM" },
  { id: "ny_pm", label: "New York PM", short: "NY PM" },
  { id: "london", label: "London", short: "LDN" },
  { id: "asia", label: "Asia", short: "ASIA" },
  { id: "frankfurt", label: "Frankfurt", short: "FRA" },
  { id: "swing", label: "Swing", short: "SWING" },
];

export const RESULTS: { id: Result; label: string }[] = [
  { id: "tp", label: "TP" },
  { id: "sl", label: "SL" },
  { id: "be", label: "BE" },
  { id: "open", label: "Open" },
];

export const TIMEFRAMES: Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

export const SETUPS = [
  "Silver Bullet",
  "FVG",
  "Order Block",
  "Breaker",
  "MSS",
  "Open Drive",
  "Judas Swing",
  "OTE",
  "SFP",
  "Break & Retest",
  "News Fade",
  "Sweep",
];

export const FIRMS = [
  "FTMO",
  "FundedNext",
  "The5ers",
  "Apex Trader Funding",
  "Topstep",
  "FundingPips",
  "E8 Markets",
  "Instant Funding",
  "Take Profit Trader",
  "Tradeify",
  "Alpha Capital",
  "Personal",
  "Другая",
];

export const ACCOUNT_TYPES: { id: AccountType; label: string }[] = [
  { id: "challenge", label: "Challenge" },
  { id: "funded", label: "Funded" },
  { id: "personal", label: "Personal" },
  { id: "demo", label: "Demo" },
];

export const VIEW_MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: "cards", label: "Карточки", hint: "Как на главной" },
  { id: "list", label: "Список", hint: "Плотнее, больше сделок" },
  { id: "minimal", label: "Минимал", hint: "Только суть" },
];

export const ICON_SETS: { id: IconSet; label: string }[] = [
  { id: "rounded", label: "Мягкие" },
  { id: "sharp", label: "Чёткие" },
  { id: "thin", label: "Тонкие" },
];

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function marketOf(pair: string): Market {
  for (const [market, pairs] of Object.entries(PAIRS) as [Market, string[]][]) {
    if (pairs.includes(pair)) return market;
  }
  return "forex";
}

export function sessionLabel(id: Session) {
  return SESSIONS.find((s) => s.id === id)?.label ?? id;
}

export function sessionShort(id: Session) {
  return SESSIONS.find((s) => s.id === id)?.short ?? id;
}
