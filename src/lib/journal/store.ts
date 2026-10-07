import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { todayISO, uid } from "../utils";
import { createSeed, emptySnapshot } from "./seed";
import type { Account, Appearance, Plan, Profile, Trade } from "./types";

type JournalState = {
  profile: Profile;
  appearance: Appearance;
  accounts: Account[];
  activeAccountId: string;
  trades: Trade[];
  plans: Plan[];
  selectedDate: string;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setSelectedDate: (iso: string) => void;
  setProfile: (p: Partial<Profile>) => void;
  setAppearance: (a: Partial<Appearance>) => void;
  addAccount: (a: Omit<Account, "id">) => string;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setActiveAccount: (id: string) => void;
  addTrade: (t: Omit<Trade, "id" | "createdAt"> & { id?: string }) => string;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  upsertPlan: (p: Omit<Plan, "id"> & { id?: string }) => string;
  deletePlan: (id: string) => void;
  resetDemo: () => void;
  clearJournal: () => void;
  importSnapshot: (data: unknown) => boolean;
};

export const useJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setSelectedDate: (iso) => set({ selectedDate: iso }),
      setProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      setAppearance: (a) => set({ appearance: { ...get().appearance, ...a } }),
      addAccount: (a) => {
        const id = uid();
        set({ accounts: [...get().accounts, { ...a, id }], activeAccountId: id });
        return id;
      },
      updateAccount: (id, patch) =>
        set({
          accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }),
      deleteAccount: (id) => {
        const { accounts, activeAccountId, trades } = get();
        if (accounts.length <= 1) return;
        const next = accounts.filter((a) => a.id !== id);
        set({
          accounts: next,
          activeAccountId: activeAccountId === id ? next[0]!.id : activeAccountId,
          trades: trades.filter((t) => t.accountId !== id),
        });
      },
      setActiveAccount: (id) => set({ activeAccountId: id }),
      addTrade: (t) => {
        const id = t.id ?? uid();
        const trade: Trade = {
          ...t,
          id,
          createdAt: new Date().toISOString(),
        };
        set({ trades: [trade, ...get().trades] });
        return id;
      },
      updateTrade: (id, patch) =>
        set({
          trades: get().trades.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
      deleteTrade: (id) => set({ trades: get().trades.filter((t) => t.id !== id) }),
      upsertPlan: (p) => {
        const existing = get().plans.find(
          (x) => x.period === p.period && x.date === p.date,
        );
        if (p.id || existing) {
          const id = p.id ?? existing!.id;
          set({
            plans: get().plans.map((x) => (x.id === id ? { ...x, ...p, id } : x)),
          });
          return id;
        }
        const id = uid();
        set({ plans: [{ ...p, id }, ...get().plans] });
        return id;
      },
      deletePlan: (id) => set({ plans: get().plans.filter((p) => p.id !== id) }),
      resetDemo: () => set({ ...createSeed(), selectedDate: todayISO() }),
      clearJournal: () => set({ ...emptySnapshot() }),
      importSnapshot: (data) => {
        if (!data || typeof data !== "object") return false;
        const d = data as Partial<JournalState>;
        if (!Array.isArray(d.trades) || !Array.isArray(d.accounts)) return false;
        set({
          profile: d.profile ?? get().profile,
          appearance: d.appearance ?? get().appearance,
          accounts: d.accounts,
          activeAccountId: d.activeAccountId ?? d.accounts[0]?.id ?? get().activeAccountId,
          trades: d.trades,
          plans: Array.isArray(d.plans) ? d.plans : [],
        });
        return true;
      },
    }),
    {
      name: "notraders.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        profile: s.profile,
        appearance: s.appearance,
        accounts: s.accounts,
        activeAccountId: s.activeAccountId,
        trades: s.trades,
        plans: s.plans,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  (window as unknown as { __journal: typeof useJournal }).__journal = useJournal;
}
  persist(
    (set, get) => ({
      ...createSeed(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setSelectedDate: (iso) => set({ selectedDate: iso }),
      setProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      setAppearance: (a) => set({ appearance: { ...get().appearance, ...a } }),
      addAccount: (a) => {
        const id = uid();
        set({ accounts: [...get().accounts, { ...a, id }], activeAccountId: id });
        return id;
      },
      updateAccount: (id, patch) =>
        set({
          accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }),
      deleteAccount: (id) => {
        const { accounts, activeAccountId, trades } = get();
        if (accounts.length <= 1) return;
        const next = accounts.filter((a) => a.id !== id);
        set({
          accounts: next,
          activeAccountId: activeAccountId === id ? next[0]!.id : activeAccountId,
          trades: trades.filter((t) => t.accountId !== id),
        });
      },
      setActiveAccount: (id) => set({ activeAccountId: id }),
      addTrade: (t) => {
        const id = t.id ?? uid();
        const trade: Trade = {
          ...t,
          id,
          createdAt: new Date().toISOString(),
        };
        set({ trades: [trade, ...get().trades] });
        return id;
      },
      updateTrade: (id, patch) =>
        set({
          trades: get().trades.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }),
      deleteTrade: (id) => set({ trades: get().trades.filter((t) => t.id !== id) }),
      upsertPlan: (p) => {
        const existing = get().plans.find(
          (x) => x.period === p.period && x.date === p.date,
        );
        if (p.id || existing) {
          const id = p.id ?? existing!.id;
          set({
            plans: get().plans.map((x) => (x.id === id ? { ...x, ...p, id } : x)),
          });
          return id;
        }
        const id = uid();
        set({ plans: [{ ...p, id }, ...get().plans] });
        return id;
      },
      deletePlan: (id) => set({ plans: get().plans.filter((p) => p.id !== id) }),
      resetDemo: () => set({ ...createSeed(), selectedDate: todayISO() }),
      clearJournal: () => set({ ...emptySnapshot() }),
      importSnapshot: (data) => {
        if (!data || typeof data !== "object") return false;
        const d = data as Partial<JournalState>;
        if (!Array.isArray(d.trades) || !Array.isArray(d.accounts)) return false;
        set({
          profile: d.profile ?? get().profile,
          appearance: d.appearance ?? get().appearance,
          accounts: d.accounts,
          activeAccountId: d.activeAccountId ?? d.accounts[0]?.id ?? get().activeAccountId,
          trades: d.trades,
          plans: Array.isArray(d.plans) ? d.plans : [],
        });
        return true;
      },
    }),
    {
      name: "notraders.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        profile: s.profile,
        appearance: s.appearance,
        accounts: s.accounts,
        activeAccountId: s.activeAccountId,
        trades: s.trades,
        plans: s.plans,
      }),
    },
  ),
);

export function activeAccount() {
  const { accounts, activeAccountId } = useJournal.getState();
  return accounts.find((a) => a.id === activeAccountId) ?? accounts[0] ?? null;
}
