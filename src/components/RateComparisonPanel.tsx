import type { RatePoint } from "@/lib/sensitivity";
import { formatUF, formatCLP } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  data: RatePoint[];
  currentRate: number;
  ufValueCLP: number;
  userIncomeUF?: number;
};

export function RateComparisonPanel({ data, currentRate, ufValueCLP, userIncomeUF }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
        Ingresa el precio de la propiedad para ver este análisis.
      </div>
    );
  }

  const hasIncome = userIncomeUF != null;
  const currentPoint = data.find((d) => Math.abs(d.annualRatePct - currentRate) < 0.01);
  const currentFeasible = currentPoint != null && hasIncome
    ? userIncomeUF! >= currentPoint.requiredIncomeUF
    : null;

  // Best (lowest) rate at which the property becomes feasible
  const bestFeasible = hasIncome
    ? data.find((d) => userIncomeUF! >= d.requiredIncomeUF)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Cada bloque muestra el dividendo mensual según la tasa que negocies con el banco.
        Desplázate para ver el rango ±1% desde tu tasa actual.
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
        {data.map((d) => {
          const isCurrent = Math.abs(d.annualRatePct - currentRate) < 0.01;
          const feasible = hasIncome ? userIncomeUF! >= d.requiredIncomeUF : null;
          const isFirstFeasible =
            hasIncome && feasible && bestFeasible?.annualRatePct === d.annualRatePct && !currentFeasible;

          return (
            <div
              key={d.annualRatePct}
              className={clsx(
                "rounded-lg border p-2 flex flex-col items-center gap-0.5 text-center",
                isCurrent
                  ? "border-blue-400 bg-blue-50 ring-1 ring-blue-300"
                  : feasible === true
                  ? "border-emerald-200 bg-emerald-50/60"
                  : feasible === false
                  ? "border-red-200 bg-red-50/40"
                  : "border-slate-200 bg-white"
              )}
            >
              <span
                className={clsx(
                  "text-xs font-bold leading-tight",
                  isCurrent ? "text-blue-700" : "text-slate-700"
                )}
              >
                {d.annualRatePct.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-600 leading-tight">
                {formatUF(d.dividendUF, 2)}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">
                {formatCLP(d.dividendUF * ufValueCLP)}
              </span>
              {feasible === true && (
                <span className="text-[9px] font-semibold text-emerald-600 leading-tight">✓</span>
              )}
              {feasible === false && (
                <span className="text-[9px] font-semibold text-red-500 leading-tight">✗</span>
              )}
              {isCurrent && (
                <span className="text-[8px] text-blue-500 leading-tight font-medium">actual</span>
              )}
              {isFirstFeasible && (
                <span className="text-[8px] text-emerald-600 leading-tight font-medium">mín.</span>
              )}
            </div>
          );
        })}
      </div>

      {hasIncome && bestFeasible && currentFeasible === false && (
        <p className="text-xs rounded-lg px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200">
          Negociando una tasa de{" "}
          <span className="font-semibold">{bestFeasible.annualRatePct.toFixed(2)}%</span> el
          dividendo bajaría a{" "}
          <span className="font-semibold">{formatUF(bestFeasible.dividendUF, 2)}</span>{" "}
          ({formatCLP(bestFeasible.dividendUF * ufValueCLP)}) — factible con tu ingreso.
        </p>
      )}

      {hasIncome && currentFeasible === true && (
        <p className="text-xs rounded-lg px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200">
          Con la tasa actual de {currentRate.toFixed(2)}% la propiedad ya es factible con tu ingreso.
        </p>
      )}
    </div>
  );
}
