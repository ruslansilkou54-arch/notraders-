import { Check, Copy, ImageDown, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { renderShareCard } from "@/lib/journal/share-image";
import { encodeTradeShare, shareUrl, tradeSummaryText } from "@/lib/journal/share";
import type { Trade } from "@/lib/journal/types";
import { Button } from "./ui";

export function ShareActions({ trade }: { trade: Trade }) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null);

  const payload = encodeTradeShare(trade);
  const url = shareUrl(payload);

  async function copy(kind: "link" | "text") {
    const value = kind === "link" ? url : tradeSummaryText(trade);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      toast.success(kind === "link" ? "Ссылка скопирована" : "Текст скопирован");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  async function nativeShare() {
    const text = tradeSummaryText(trade);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${trade.pair} · notraders`, text, url });
      } else {
        await copy("link");
      }
    } catch {
      /* user cancelled */
    }
  }

  async function downloadCard() {
    try {
      const blob = await renderShareCard(trade);
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `notraders-${trade.pair}-${trade.result}.png`;
      a.click();
      URL.revokeObjectURL(href);
      toast.success("Карточка сохранена");
    } catch {
      toast.error("Не удалось собрать карточку");
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="surface" onClick={() => void nativeShare()}>
        <Share2 className="size-4" />
        Поделиться
      </Button>
      <Button type="button" variant="surface" onClick={() => void copy("link")}>
        {copied === "link" ? <Check className="size-4" /> : <Link2 className="size-4" />}
        Ссылка
      </Button>
      <Button type="button" variant="surface" onClick={() => void copy("text")}>
        {copied === "text" ? <Check className="size-4" /> : <Copy className="size-4" />}
        Текст
      </Button>
      <Button type="button" variant="surface" onClick={() => void downloadCard()}>
        <ImageDown className="size-4" />
        Карточка
      </Button>
    </div>
  );
}
