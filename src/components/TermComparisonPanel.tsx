import type { TermMaxPoint } from "@/lib/sensitivity";
import { formatUF, formatCLP } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  data: TermMaxPoint[];
  currentTerm: number;
  ufValueCLP: number;
};

const TERM_COLORS: Record<number, string> = {
  15: "bg-red-400",
  20: "bg-amber-400",
  25: "bg-blue-500",
  30: "bg-emerald-500",
};

export function TermComparisonPanel({ data, currentTerm, ufValueCLP }: Props) {
  if (data.length === 0 || data.every((d) => d.maxPropertyUF === 0)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
        Ingresa tu ingreso para ver cómo el plazo afecta lo que puedes comprar.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.maxPropertyUF));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Propiedad máxima estimada según el plazo del crédito, con tu ingreso y ahorros actuales.
      </p>
      <div className="flex flex-col gap-3">
        {data.map((d) => {
          const isCurrent = d.termYears === currentTerm;
          const pct = maxVal > 0 ? (d.maxPropertyUF / maxVal) * 100 : 0;
          const barColor = TERM_COLORS[d.termYears] ?? "bg-slate-400";
          return (
            <div key={d.termYears} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className={clsx("font-medium", isCurrent ? "text-slate-900" : "text-slate-600")}>
                  {d.termYears} años{isCurrent && <span className="ml-1.5 text-[10px] text-blue-600 font-semibold">← actual</span>}
                </span>
                <span className={clsx("font-semibold", isCurrent ? "text-slate-900" : "text-slate-600")}>
                  {formatUF(d.maxPropertyUF, 0)}
                  <span className="ml-1.5 font-normal text-slate-400">{formatCLP(d.maxPropertyUF * ufValueCLP)}</span>
                </span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={clsx("h-full rounded-full transition-all duration-300", barColor, isCurrent && "ring-2 ring-offset-1 ring-blue-400")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {data.length >= 2 && (
        <p className="text-[11px] text-slate-400 border-t pt-2">
          Diferencia entre {data[0].termYears} y {data[data.length - 1].termYears} años:{" "}
          <span className="font-semibold text-emerald-600">
            +{formatUF(data[data.length - 1].maxPropertyUF - data[0].maxPropertyUF, 0)}
          </span>
        </p>
      )}
    </div>
  );
}
