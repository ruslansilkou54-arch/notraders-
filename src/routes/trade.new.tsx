import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TradeForm } from "@/components/trade-form";

export const Route = createFileRoute("/trade/new")({ component: NewTradePage });

function NewTradePage() {
  return (
    <div className="pt-[max(0.5rem,env(safe-area-inset-top))]">
      <PageHeader title="Новая сделка" back />
      <TradeForm />
    </div>
  );
}
