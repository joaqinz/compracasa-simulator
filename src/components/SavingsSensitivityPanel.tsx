import { formatUF, formatCLP } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  currentSavingsUF: number;
  ufValueCLP: number;
  maxFinancingPct: number;
  maxPropertyByIncomeUF?: number;
};

export function SavingsSensitivityPanel({
  currentSavingsUF,
  ufValueCLP,
  maxFinancingPct,
  maxPropertyByIncomeUF,
}: Props) {
  const hasIncome = maxPropertyByIncomeUF != null && maxPropertyByIncomeUF > 0;
  const hasSavings = currentSavingsUF > 0;
  const minPiePct = 100 - maxFinancingPct;
  const minPieUF = hasIncome ? maxPropertyByIncomeUF! * (minPiePct / 100) : undefined;
  const gap = minPieUF != null ? currentSavingsUF - minPieUF : undefined;
  const surplus = gap != null && gap >= 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Para acceder a tu propiedad máxima alcanzable, el banco exige un pie mínimo (Financiamiento Máximo en condiciones bancarias).
        Aquí ves si tus ahorros lo cubren.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Box 1 — Pie mínimo del banco */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-1">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Pie mínimo del banco
          </p>
          {hasIncome ? (
            <>
              <p className="text-xl font-bold text-slate-800">{formatUF(minPieUF!, 0)}</p>
              <p className="text-xs text-slate-500">{formatCLP(minPieUF! * ufValueCLP)}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {minPiePct}% de {formatUF(maxPropertyByIncomeUF!, 0)} — límite del banco:
                financia máximo el {maxFinancingPct}%
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic mt-1">
              Ingresa tu ingreso para calcularlo
            </p>
          )}
        </div>

        {/* Box 2 — Tus ahorros */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-1">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Tus ahorros disponibles
          </p>
          {hasSavings ? (
            <>
              <p className="text-xl font-bold text-slate-800">{formatUF(currentSavingsUF, 0)}</p>
              <p className="text-xs text-slate-500">{formatCLP(currentSavingsUF * ufValueCLP)}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic mt-1">
              Ingresa tus ahorros
            </p>
          )}
        </div>

        {/* Box 3 — Diferencia */}
        <div
          className={clsx(
            "rounded-xl border p-4 flex flex-col gap-1",
            !hasIncome || !hasSavings
              ? "border-slate-200 bg-slate-50"
              : surplus
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          )}
        >
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            {!hasIncome || !hasSavings ? "Diferencia" : surplus ? "Te alcanza" : "Te falta"}
          </p>
          {hasIncome && hasSavings && gap != null ? (
            <>
              <p
                className={clsx(
                  "text-xl font-bold",
                  surplus ? "text-emerald-700" : "text-amber-700"
                )}
              >
                {surplus ? "+" : "-"}{formatUF(Math.abs(gap), 0)}
              </p>
              <p className={clsx("text-xs", surplus ? "text-emerald-600" : "text-amber-600")}>
                {formatCLP(Math.abs(gap) * ufValueCLP)}
              </p>
              <p className={clsx("text-[11px] mt-1", surplus ? "text-emerald-600" : "text-amber-600")}>
                {surplus
                  ? "Tus ahorros cubren el pie mínimo requerido."
                  : `Necesitas ${formatCLP(Math.abs(gap) * ufValueCLP)} más para el pie.`}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic mt-1">
              Completa ingreso y ahorros
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
