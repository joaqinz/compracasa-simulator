import type { SensitivityRow } from "@/types/finance";
import { formatUF, formatCLP } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  rows: SensitivityRow[];
  ufValueCLP: number;
  highlightPropertyUF?: number;
};

function MoneyCell({ uf, clp, decimals = 2 }: { uf: number; clp: number; decimals?: 0 | 2 }) {
  return (
    <td className="px-3 py-1.5 text-right">
      <div>{formatUF(uf, decimals)}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{formatCLP(clp)}</div>
    </td>
  );
}

export function ScenarioTable({ rows, ufValueCLP, highlightPropertyUF }: Props) {
  if (rows.length === 0) return null;

  return (
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
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isHighlighted =
              highlightPropertyUF != null &&
              Math.abs(row.propertyPriceUF - highlightPropertyUF) < 50;
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
