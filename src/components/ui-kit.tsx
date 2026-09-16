import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
};

export function Button({ variant = "primary", loading, className, children, ...rest }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";
  const styles = {
    primary:
      "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5",
    outline: "border border-border bg-background hover:bg-muted",
    ghost: "hover:bg-muted",
  }[variant];

  return (
    <button className={cn(base, styles, className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-28 resize-y", className)} {...rest} />;
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ThinkingLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-violet [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-cyan" />
      </span>
      {label}
    </div>
  );
}
