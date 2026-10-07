import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Chip, Field, Input, Select, Sheet } from "@/components/ui";
import {
  ACCOUNT_TYPES,
  ACCENTS,
  FIRMS,
  ICON_SETS,
  VIEW_MODES,
} from "@/lib/journal/constants";
import { money } from "@/lib/journal/format";
import { compressAvatar } from "@/lib/journal/images";
import { accountEquity, accountPnl, targetProgress } from "@/lib/journal/stats";
import { useJournal } from "@/lib/journal/store";
import type { Account, AccountType, Density, IconSet, ViewMode } from "@/lib/journal/types";
import { accentFg, cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const profile = useJournal((s) => s.profile);
  const setProfile = useJournal((s) => s.setProfile);
  const appearance = useJournal((s) => s.appearance);
  const setAppearance = useJournal((s) => s.setAppearance);
  const accounts = useJournal((s) => s.accounts);
  const trades = useJournal((s) => s.trades);
  const activeAccountId = useJournal((s) => s.activeAccountId);
  const setActiveAccount = useJournal((s) => s.setActiveAccount);
  const deleteAccount = useJournal((s) => s.deleteAccount);
  const resetDemo = useJournal((s) => s.resetDemo);
  const clearJournal = useJournal((s) => s.clearJournal);
  const importSnapshot = useJournal((s) => s.importSnapshot);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Account | null | "new">(null);
  const [name, setName] = useState(profile.name);

  async function onAvatar(file?: File) {
    if (!file) return;
    try {
      const src = await compressAvatar(file);
      setProfile({ avatarSrc: src });
    } catch {
      toast.error("Не удалось загрузить фото");
    }
  }

  function exportJson() {
    const { appearance: a, profile: p, accounts: acc, trades: t, plans, activeAccountId: id } =
      useJournal.getState();
    const blob = new Blob(
      [JSON.stringify({ appearance: a, profile: p, accounts: acc, trades: t, plans, activeAccountId: id }, null, 2)],
      { type: "application/json" },
    );
    const href = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = href;
    el.download = "notraders-journal.json";
    el.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <PageHeader title="Профиль" />

      <div className="flex items-center gap-4">
        <button type="button" onClick={() => avatarRef.current?.click()} className="relative">
          <Avatar name={name || profile.name} src={profile.avatarSrc} size="lg" />
          <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-accent text-accent-fg">
            <Pencil className="size-3" />
          </span>
        </button>
        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void onAvatar(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div className="flex-1">
          <Field label="Имя">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setProfile({ name: name.trim() || "Trader" })}
            />
          </Field>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Счета · проп-фирмы</h2>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="grid size-9 place-items-center rounded-full bg-accent text-accent-fg"
            aria-label="Добавить счёт"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {accounts.map((a) => {
            const eq = accountEquity(a, trades);
            const pnl = accountPnl(trades, a.id);
            const prog = targetProgress(a, trades);
            const active = a.id === activeAccountId;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-[24px] bg-surface p-4",
                  active && "shadow-[0_0_0_1px_var(--accent)]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => setActiveAccount(a.id)}
                  >
                    <p className="text-[11px] text-muted">{a.firm}</p>
                    <p className="text-[16px] font-semibold">{a.name}</p>
                    <p className="mt-1 text-xs tabular text-muted">
                      {money(eq, a.currency)} ·{" "}
                      <span className={pnl >= 0 ? "text-win" : "text-loss"}>{money(pnl)}</span>
                    </p>
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="grid size-9 place-items-center rounded-full bg-surface-2"
                      onClick={() => setEditing(a)}
                      aria-label="Редактировать"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    {accounts.length > 1 ? (
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-full bg-surface-2 text-loss"
                        onClick={() => deleteAccount(a.id)}
                        aria-label="Удалить"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
                {a.profitTargetPct > 0 ? (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.min(100, prog)}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold">Внешний вид</h2>
        <p className="mb-2 text-xs text-muted">Цвет акцента</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.name}
              onClick={() => setAppearance({ accentHex: c.hex })}
              className={cn(
                "size-9 rounded-full",
                appearance.accentHex.toLowerCase() === c.hex.toLowerCase() &&
                  "ring-2 ring-fg ring-offset-2 ring-offset-bg",
              )}
              style={{ background: c.hex }}
            />
          ))}
          <label className="relative size-9 overflow-hidden rounded-full bg-surface-2">
            <input
              type="color"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={appearance.accentHex}
              onChange={(e) => setAppearance({ accentHex: e.target.value })}
            />
            <span
              className="block size-full"
              style={{
                background: `conic-gradient(${appearance.accentHex}, ${accentFg(appearance.accentHex)})`,
              }}
            />
          </label>
        </div>

        <p className="mb-2 text-xs text-muted">Вид карточек</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {VIEW_MODES.map((v) => (
            <Chip
              key={v.id}
              active={appearance.view === v.id}
              onClick={() => setAppearance({ view: v.id as ViewMode })}
            >
              {v.label}
            </Chip>
          ))}
        </div>

        <p className="mb-2 text-xs text-muted">Плотность</p>
        <div className="mb-4 flex gap-1.5">
          {(
            [
              ["comfortable", "Комфорт"],
              ["compact", "Компакт"],
            ] as const
          ).map(([id, label]) => (
            <Chip
              key={id}
              active={appearance.density === id}
              onClick={() => setAppearance({ density: id as Density })}
            >
              {label}
            </Chip>
          ))}
        </div>

        <p className="mb-2 text-xs text-muted">Иконки</p>
        <div className="flex gap-1.5">
          {ICON_SETS.map((s) => (
            <Chip
              key={s.id}
              active={appearance.iconSet === s.id}
              onClick={() => setAppearance({ iconSet: s.id as IconSet })}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[15px] font-semibold">Данные</h2>
        <Button variant="surface" onClick={exportJson}>
          Экспорт JSON
        </Button>
        <Button variant="surface" onClick={() => fileRef.current?.click()}>
          Импорт JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              const data = JSON.parse(await file.text());
              if (importSnapshot(data)) toast.success("Журнал импортирован");
              else toast.error("Файл не похож на журнал");
            } catch {
              toast.error("Некорректный JSON");
            }
          }}
        />
        <Button variant="muted" onClick={() => { resetDemo(); toast.success("Демо восстановлено"); }}>
          Восстановить демо
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("Очистить все сделки и счета?")) {
              clearJournal();
              toast.success("Журнал очищен");
            }
          }}
        >
          Очистить журнал
        </Button>
      </section>

      <AccountSheet
        key={editing === "new" ? "new" : editing?.id ?? "closed"}
        open={editing !== null}
        initial={editing === "new" || !editing ? null : editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function AccountSheet({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: Account | null;
  onClose: () => void;
}) {
  const addAccount = useJournal((s) => s.addAccount);
  const updateAccount = useJournal((s) => s.updateAccount);
  const [name, setName] = useState(initial?.name ?? "");
  const [firm, setFirm] = useState(initial?.firm ?? "FTMO");
  const [type, setType] = useState<AccountType>(initial?.type ?? "challenge");
  const [startBalance, setStartBalance] = useState(String(initial?.startBalance ?? 100000));
  const [profitTargetPct, setProfitTargetPct] = useState(String(initial?.profitTargetPct ?? 10));
  const [maxDrawdownPct, setMaxDrawdownPct] = useState(String(initial?.maxDrawdownPct ?? 10));
  const [dailyLossPct, setDailyLossPct] = useState(String(initial?.dailyLossPct ?? 5));

  const title = initial ? "Счёт" : "Новый счёт";

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={title}
    >
      <div className="flex flex-col gap-3">
        <Field label="Название">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="FTMO 100k" />
        </Field>
        <Field label="Проп-фирма">
          <Select value={firm} onChange={(e) => setFirm(e.target.value)}>
            {FIRMS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
        <Field label="Тип">
          <Select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Баланс">
          <Input value={startBalance} onChange={(e) => setStartBalance(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Цель %">
            <Input value={profitTargetPct} onChange={(e) => setProfitTargetPct(e.target.value)} />
          </Field>
          <Field label="DD %">
            <Input value={maxDrawdownPct} onChange={(e) => setMaxDrawdownPct(e.target.value)} />
          </Field>
          <Field label="Daily %">
            <Input value={dailyLossPct} onChange={(e) => setDailyLossPct(e.target.value)} />
          </Field>
        </div>
        <Button
          size="pill"
          onClick={() => {
            const payload = {
              name: name.trim() || firm,
              firm,
              type,
              currency: "USD" as const,
              startBalance: Number(startBalance) || 0,
              profitTargetPct: Number(profitTargetPct) || 0,
              maxDrawdownPct: Number(maxDrawdownPct) || 0,
              dailyLossPct: Number(dailyLossPct) || 0,
            };
            if (initial) updateAccount(initial.id, payload);
            else addAccount(payload);
            toast.success("Счёт сохранён");
            onClose();
          }}
        >
          Сохранить
        </Button>
      </div>
    </Sheet>
  );
}
