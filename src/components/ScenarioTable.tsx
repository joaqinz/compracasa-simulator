import { useState } from "react";
import type { SensitivityRow } from "@/types/finance";
import { formatUF, formatCLP } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  rows: SensitivityRow[];
  ufValueCLP: number;
  highlightPropertyUF?: number;
  userIncomeUF?: number;
  userSavingsUF?: number;
};

function MoneyCell({ uf, clp, decimals = 2 }: { uf: number; clp: number; decimals?: 0 | 2 }) {
  return (
    <td className="px-3 py-1.5 text-right">
      <div>{formatUF(uf, decimals)}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{formatCLP(clp)}</div>
    </td>
  );
}

export function ScenarioTable({ rows, ufValueCLP, highlightPropertyUF, userIncomeUF, userSavingsUF }: Props) {
  const [showOnlyFeasible, setShowOnlyFeasible] = useState(false);

  if (rows.length === 0) return null;

  const hasUserData = userIncomeUF != null || userSavingsUF != null;
  const visibleRows = showOnlyFeasible ? rows.filter((r) => r.feasible) : rows;

  function getBrecha(row: SensitivityRow): { gap: number; kind: "income" | "savings" } | null {
    if (row.feasible) return null;
    const incomeGap = userIncomeUF != null ? row.requiredIncomeUF - userIncomeUF : 0;
    const savingsGap = userSavingsUF != null ? row.downPaymentUF - userSavingsUF : 0;
    if (savingsGap > 0 && savingsGap >= incomeGap) return { gap: savingsGap, kind: "savings" };
    if (incomeGap > 0) return { gap: incomeGap, kind: "income" };
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-600">Escenarios de compra</h3>
        {hasUserData && (
          <button
            type="button"
            onClick={() => setShowOnlyFeasible((v) => !v)}
            className={clsx(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              showOnlyFeasible
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-medium"
                : "border-slate-200 text-slate-500 hover:text-slate-700"
            )}
          >
            {showOnlyFeasible ? "Mostrando solo factibles" : "Solo mostrar factibles"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-right font-medium">Propiedad</th>
              <th className="px-3 py-2 text-right font-medium">Pie %</th>
              <th className="px-3 py-2 text-right font-medium">Pie</th>
              <th className="px-3 py-2 text-right font-medium">Crédito</th>
              <th className="px-3 py-2 text-right font-medium">Dividendo</th>
              <th className="px-3 py-2 text-right font-medium">Ingreso req.</th>
              <th className="px-3 py-2 text-center font-medium">Factible</th>
              {hasUserData && <th className="px-3 py-2 text-right font-medium">Brecha</th>}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => {
              const isHighlighted =
                highlightPropertyUF != null &&
                Math.abs(row.propertyPriceUF - highlightPropertyUF) < 50;
              const brecha = getBrecha(row);
              return (
                <tr
                  key={i}
                  className={clsx(
                    "border-t border-slate-100",
                    isHighlighted && "bg-blue-50 font-semibold",
                    !isHighlighted && row.feasible && "bg-emerald-50/30",
                    !row.feasible && "bg-red-50/30"
                  )}
                >
                  <MoneyCell uf={row.propertyPriceUF} clp={row.propertyPriceUF * ufValueCLP} decimals={0} />
                  <td className="px-3 py-1.5 text-right">{row.downPaymentPct.toFixed(0)}%</td>
                  <MoneyCell uf={row.downPaymentUF} clp={row.downPaymentUF * ufValueCLP} />
                  <MoneyCell uf={row.loanAmountUF} clp={row.loanAmountUF * ufValueCLP} decimals={0} />
                  <MoneyCell uf={row.fullDividendUF} clp={row.fullDividendUF * ufValueCLP} />
                  <MoneyCell uf={row.requiredIncomeUF} clp={row.requiredIncomeUF * ufValueCLP} />
                  <td className="px-3 py-1.5 text-center">
                    <span className={row.feasible ? "text-emerald-600 font-bold" : "text-red-500"}>
                      {row.feasible ? "✓" : "✗"}
                    </span>
                  </td>
                  {hasUserData && (
                    <td className="px-3 py-1.5 text-right">
                      {brecha ? (
                        <span className={brecha.kind === "income" ? "text-red-500 font-medium" : "text-amber-600 font-medium"}>
                          +{formatCLP(brecha.gap * ufValueCLP)}
                        </span>
                      ) : (
                        <span className="text-emerald-500">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
