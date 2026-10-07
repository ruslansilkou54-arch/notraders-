import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  back,
  action,
}: {
  title: string;
  back?: boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-2 px-5 pt-4 pb-2">
      {back ? (
        <button
          type="button"
          aria-label="Назад"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-full bg-surface text-fg"
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : (
        <span className="w-0" />
      )}
      <h1 className="flex-1 text-center text-[17px] font-semibold tracking-tight">{title}</h1>
      <div className="flex min-w-11 justify-end">{action}</div>
    </header>
  );
}
