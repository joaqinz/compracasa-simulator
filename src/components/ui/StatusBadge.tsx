import type { AffordabilityStatus } from "@/types/finance";
import clsx from "clsx";

type Props = { status: AffordabilityStatus; large?: boolean };

const config = {
  green:  { label: "Alcanzable",     bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", icon: "✓" },
  yellow: { label: "Ajustado",       bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300",   icon: "!" },
  red:    { label: "Fuera de rango", bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300",     icon: "✗" },
};

export function StatusBadge({ status, large = false }: Props) {
  const c = config[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        c.bg, c.text, c.border,
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
      )}
    >
      <span className="font-bold">{c.icon}</span>
      {c.label}
    </span>
  );
}
