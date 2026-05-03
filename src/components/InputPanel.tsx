import type { ScenarioInput, MoneyUnit } from "@/types/finance";
import { MoneyInput } from "./ui/MoneyInput";
import { BankSelector } from "./BankSelector";

const TERM_OPTIONS = [15, 20, 25, 30];

type Props = {
  scenario: ScenarioInput;
  onChange: (patch: Partial<ScenarioInput>) => void;
};

export function InputPanel({ scenario, onChange }: Props) {
  const { mode } = scenario;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

        {/* Col 1: primary money inputs */}
        <div className="flex flex-col gap-3">
          <div>
            <MoneyInput
              label="Ingreso mensual neto"
              value={scenario.netMonthlyIncomeAmount}
              unit={scenario.netMonthlyIncomeUnit}
              onValueChange={(v) => onChange({ netMonthlyIncomeAmount: v })}
              onUnitChange={(u: MoneyUnit) => onChange({ netMonthlyIncomeUnit: u })}
              placeholder={scenario.netMonthlyIncomeUnit === "CLP" ? "ej. 2.500.000" : "ej. 62,3"}
              tooltipTermId="carga-financiera"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Puedes sumar el ingreso de tu pareja o co-deudor.
            </p>
          </div>

          {mode === "income" && (
            <MoneyInput
              label="Ahorros disponibles (pie)"
              value={scenario.savingsAmount}
              unit={scenario.savingsUnit}
              onValueChange={(v) => onChange({ savingsAmount: v })}
              onUnitChange={(u: MoneyUnit) => onChange({ savingsUnit: u })}
              placeholder={scenario.savingsUnit === "CLP" ? "ej. 30.000.000" : "ej. 750"}
              tooltipTermId="pie"
            />
          )}

          {mode === "target_property" && (
            <MoneyInput
              label="Precio de la propiedad objetivo"
              value={scenario.targetPropertyAmount}
              unit={scenario.targetPropertyUnit}
              onValueChange={(v) => onChange({ targetPropertyAmount: v })}
              onUnitChange={(u: MoneyUnit) => onChange({ targetPropertyUnit: u })}
              placeholder={scenario.targetPropertyUnit === "CLP" ? "ej. 140.000.000" : "ej. 3.500"}
              tooltipTermId="uf"
            />
          )}
        </div>

        {/* Col 2: credit conditions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Plazo del crédito</label>
            <div className="grid grid-cols-2 gap-2">
              {TERM_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ termYears: t })}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                    scenario.termYears === t
                      ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                      : "bg-white border-slate-300 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {t} años
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Col 3: bank selector */}
        <BankSelector
          selectedBankId={scenario.selectedBankId}
          termYears={scenario.termYears}
          annualRatePct={scenario.annualRatePct}
          caePct={scenario.caePct}
          monthlyInsuranceUF={scenario.monthlyInsuranceUF}
          maxFinancingPct={scenario.maxFinancingPct}
          maxDividendIncomeRatioPct={scenario.maxDividendIncomeRatioPct}
          onChange={onChange}
        />
      </div>

    </div>
  );
}
