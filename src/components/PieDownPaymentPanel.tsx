import type { PieRatePoint } from "@/lib/sensitivity";
import { formatUF, formatCLP } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  data: PieRatePoint[];
  currentRate: number;
  currentPiePct: number;
  targetPropertyUF: number;
  maxFinancingPct: number;
  ufValueCLP: number;
  userIncomeUF?: number;
};

export function PieDownPaymentPanel({
  data,
  currentRate,
  currentPiePct,
  targetPropertyUF,
  maxFinancingPct,
  ufValueCLP,
  userIncomeUF,
}: Props) {
  if (targetPropertyUF <= 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
        Ingresa el precio de la propiedad para ver este análisis.
      </div>
    );
  }

  const filtered = data
    .filter((d) => Math.abs(d.annualRatePct - currentRate) < 0.05)
    .sort((a, b) => a.downPaymentPct - b.downPaymentPct);

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
        No hay datos disponibles.
      </div>
    );
  }

  const hasIncome = userIncomeUF != null;
  const firstFeasibleIdx = hasIncome
    ? filtered.findIndex((d) => d.feasible)
    : -1;

  let minSavingsMsg: { text: string; ok: boolean } | null = null;
  if (hasIncome) {
    if (firstFeasibleIdx < 0) {
      minSavingsMsg = {
        text: "Con tu ingreso actual, la propiedad no es factible en ningún nivel de pie.",
        ok: false,
      };
    } else if (firstFeasibleIdx === 0) {
      minSavingsMsg = {
        text: "Con tu ingreso actual, la propiedad es factible desde el pie mínimo requerido.",
        ok: true,
      };
    } else {
      const minPct = filtered[firstFeasibleIdx].downPaymentPct;
      const effectiveEquity = Math.max(minPct / 100, 1 - maxFinancingPct / 100);
      const minSavingsUF = targetPropertyUF * effectiveEquity;
      minSavingsMsg = {
        text: `Necesitas al menos ${formatUF(minSavingsUF, 0)} (${formatCLP(minSavingsUF * ufValueCLP)}) de pie para que el dividendo sea factible con tu ingreso.`,
        ok: true,
      };
    }
  }

  const bankMinPiePct = 100 - maxFinancingPct;
  const hasEffectiveOverride = filtered.some((d) => d.downPaymentPct < bankMinPiePct);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Cómo cambia el dividendo y la viabilidad según cuánto pie puedas aportar,
        a la tasa actual y precio objetivo.
      </p>
      {hasEffectiveOverride && (
        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          El banco financia máximo el {maxFinancingPct}% del valor de la propiedad
          (condición de <span className="font-medium">Financiamiento Máximo</span>),
          por lo que el pie mínimo efectivo es{" "}
          <span className="font-semibold">{bankMinPiePct}%</span>{" "}
          independiente del % que indiques. Los montos de ahorro reflejan este mínimo cuando corresponde.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-right font-medium">Pie %</th>
              <th className="px-3 py-2 text-right font-medium">Ahorro necesario</th>
              <th className="px-3 py-2 text-right font-medium">Dividendo mens.</th>
              <th className="px-3 py-2 text-right font-medium">Ingreso req.</th>
              {hasIncome && <th className="px-3 py-2 text-center font-medium">Estado</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const isCurrent = Math.abs(d.downPaymentPct - currentPiePct) < 1;
              const isFirstFeasible = hasIncome && i === firstFeasibleIdx && firstFeasibleIdx > 0;
              const effectiveEquity = Math.max(d.downPaymentPct / 100, 1 - maxFinancingPct / 100);
              const downPaymentUF = targetPropertyUF * effectiveEquity;
              const incomeGap =
                hasIncome && !d.feasible ? d.requiredIncomeUF - userIncomeUF! : 0;

              return (
                <tr
                  key={d.downPaymentPct}
                  className={clsx(
                    "border-t border-slate-100",
                    isCurrent && "bg-blue-50",
                    !isCurrent && d.feasible && hasIncome && "bg-emerald-50/30",
                    !d.feasible && "bg-red-50/20"
                  )}
                >
                  <td className="px-3 py-2 text-right font-semibold">
                    {d.downPaymentPct}%
                    {isCurrent && (
                      <span className="ml-1.5 text-[10px] text-blue-600 font-medium">← actual</span>
                    )}
                    {isFirstFeasible && (
                      <span className="ml-1.5 text-[10px] text-emerald-600 font-medium">← mín. factible</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div>{formatUF(downPaymentUF, 0)}</div>
                    <div className="text-[10px] text-slate-400">{formatCLP(downPaymentUF * ufValueCLP)}</div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div>{formatUF(d.dividendUF, 2)}</div>
                    <div className="text-[10px] text-slate-400">{formatCLP(d.dividendUF * ufValueCLP)}</div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div>{formatUF(d.requiredIncomeUF, 2)}</div>
                    <div className="text-[10px] text-slate-400">{formatCLP(d.requiredIncomeUF * ufValueCLP)}</div>
                  </td>
                  {hasIncome && (
                    <td className="px-3 py-2 text-center">
                      {d.feasible ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <div>
                          <span className="text-red-500 font-bold">✗</span>
                          {incomeGap > 0 && (
                            <div className="text-[10px] text-red-400 mt-0.5">
                              +{formatCLP(incomeGap * ufValueCLP)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {minSavingsMsg && (
        <p
          className={clsx(
            "text-xs rounded-lg px-3 py-2",
            minSavingsMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}
        >
          {minSavingsMsg.text}
        </p>
      )}
    </div>
  );
}
