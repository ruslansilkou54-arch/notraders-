import { cva, type VariantProps } from "class-variance-authority";
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold select-none transition-[transform,background-color,opacity] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg",
        surface: "bg-surface text-fg shadow-[var(--shadow-border)]",
        ghost: "bg-transparent text-fg",
        muted: "bg-surface-2 text-muted",
        danger: "bg-loss/15 text-loss",
      },
      size: {
        md: "h-11 px-4 rounded-2xl text-sm",
        lg: "h-12 px-5 rounded-full text-[15px]",
        sm: "h-8 px-3 rounded-full text-xs",
        icon: "size-11 rounded-full",
        pill: "h-12 w-full rounded-full px-5 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
>(function Button({ className, variant, size, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-muted">{label}</span>
      {children}
      {hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-2xl bg-surface-2 px-4 text-sm text-fg outline-none shadow-[var(--shadow-border)] placeholder:text-faint focus:shadow-[var(--shadow-border-hover)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClass, className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full resize-y rounded-2xl bg-surface-2 px-4 py-3 text-sm text-fg outline-none shadow-[var(--shadow-border)] placeholder:text-faint",
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(inputClass, "appearance-none pr-8", className)}
      {...props}
    />
  );
});

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors duration-150",
        active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex rounded-full bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "h-8 flex-1 rounded-full px-3 text-xs font-semibold transition-colors duration-150",
            value === o.id ? "bg-accent text-accent-fg" : "text-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-bg/70" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[430px] flex-col rounded-t-3xl bg-surface outline-none">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-3" />
          <Drawer.Title className="px-5 pt-4 text-base font-semibold">{title}</Drawer.Title>
          <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "size-8 text-[10px]" : size === "lg" ? "size-14 text-lg" : "size-11 text-sm";
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("rounded-full object-cover", dim)}
      />
    );
  }
  const parts = name.trim().split(/\s+/);
  const ini =
    parts.length >= 2
      ? (parts[0]![0] + parts[1]![0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-surface-3 font-semibold text-fg",
        dim,
      )}
    >
      {ini || "N"}
    </div>
  );
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[28px] bg-surface px-6 py-10 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {action}
    </div>
  );
}
