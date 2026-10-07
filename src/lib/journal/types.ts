export type Market = "indices" | "forex" | "metals" | "crypto";
export type Side = "long" | "short";
export type Session = "ny_am" | "ny_pm" | "london" | "asia" | "frankfurt" | "swing";
export type Result = "tp" | "sl" | "be" | "open";
export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1";
export type AccountType = "challenge" | "funded" | "personal" | "demo";
export type PlanPeriod = "day" | "week";
export type Density = "comfortable" | "compact";
export type ViewMode = "cards" | "list" | "minimal";
export type IconSet = "rounded" | "sharp" | "thin";

export type TradeShot = {
  id: string;
  src: string;
  timeframe: Timeframe;
};

export type Trade = {
  id: string;
  accountId: string;
  title: string;
  pair: string;
  market: Market;
  side: Side;
  openedAt: string;
  session: Session;
  riskPct: number;
  rr: number;
  result: Result;
  context: string;
  setup: string;
  profitPct: number;
  profitUsd: number;
  rMultiple: number;
  notes: string;
  screenshots: TradeShot[];
  createdAt: string;
};

export type Account = {
  id: string;
  name: string;
  firm: string;
  type: AccountType;
  currency: string;
  startBalance: number;
  profitTargetPct: number;
  maxDrawdownPct: number;
  dailyLossPct: number;
};

export type Plan = {
  id: string;
  period: PlanPeriod;
  date: string;
  bias: string;
  focusPairs: string[];
  maxTrades: number;
  maxRiskPct: number;
  rules: string[];
  notes: string;
};

export type Profile = {
  name: string;
  avatarSrc: string | null;
};

export type Appearance = {
  accentHex: string;
  density: Density;
  view: ViewMode;
  iconSet: IconSet;
};

export type JournalSnapshot = {
  profile: Profile;
  appearance: Appearance;
  accounts: Account[];
  activeAccountId: string;
  trades: Trade[];
  plans: Plan[];
};
