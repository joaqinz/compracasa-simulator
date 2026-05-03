import { lazy, Suspense, useState } from "react";
import type { ScenarioInput, SensitivityRow } from "@/types/finance";
import type { RatePoint, PieRatePoint, TermMaxPoint, RateMaxPoint } from "@/lib/sensitivity";
import { toUF } from "@/lib/money";
import { ScenarioTable } from "./ScenarioTable";
import { PieDownPaymentPanel } from "./PieDownPaymentPanel";
import { RateComparisonPanel } from "./RateComparisonPanel";
import { TermComparisonPanel } from "./TermComparisonPanel";
import { SavingsSensitivityPanel } from "./SavingsSensitivityPanel";
import { ErrorBoundary } from "./ui/ErrorBoundary";

type Props = {
  // income mode
  termMaxData: TermMaxPoint[];
  rateMaxData: RateMaxPoint[];
  maxPropertyByIncomeUF?: number;
  // target_property mode
  rateData: RatePoint[];
  pieRateData: PieRatePoint[];
  targetPropertyUF?: number;
  // shared
  tableRows: SensitivityRow[];
  input: ScenarioInput;
  highlightPropertyUF?: number;
};

const incomeTabs = ["Por plazo", "Ahorros y Pie", "Por tasa"];
const targetTabs = ["Por pie", "Por tasa"];

const RateMaxPropertyChart = lazy(() =>
  import("./charts/RateMaxPropertyChart").then((m) => ({ default: m.RateMaxPropertyChart }))
);

function ChartLoading() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      Cargando…
    </div>
  );
}

export function SensitivityPanel({
  termMaxData,
  rateMaxData,
  maxPropertyByIncomeUF,
  rateData,
  pieRateData,
  targetPropertyUF,
  tableRows,
  input,
  highlightPropertyUF,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTable, setShowTable] = useState(true);
  const isTargetMode = input.mode === "target_property";
  const tabs = isTargetMode ? targetTabs : incomeTabs;

  const currentSavingsUF =
    input.savingsAmount != null
      ? toUF(input.savingsAmount, input.savingsUnit, input.ufValueCLP)
      : 0;

  const userIncomeUF =
    input.netMonthlyIncomeAmount != null
      ? toUF(input.netMonthlyIncomeAmount, input.netMonthlyIncomeUnit, input.ufValueCLP)
      : undefined;

  const userSavingsUF = currentSavingsUF > 0 ? currentSavingsUF : undefined;

  function renderContent() {
    if (isTargetMode) {
      if (activeTab === 0) {
        return (
          <PieDownPaymentPanel
            data={pieRateData}
            currentRate={input.annualRatePct}
            currentPiePct={input.downPaymentPct}
            targetPropertyUF={targetPropertyUF ?? 0}
            maxFinancingPct={input.maxFinancingPct}
            ufValueCLP={input.ufValueCLP}
            userIncomeUF={userIncomeUF}
          />
        );
      }
      return (
        <RateComparisonPanel
          data={rateData}
          currentRate={input.annualRatePct}
          ufValueCLP={input.ufValueCLP}
          userIncomeUF={userIncomeUF}
        />
      );
    }

    // income mode
    if (activeTab === 0) {
      return (
        <TermComparisonPanel
          data={termMaxData}
          currentTerm={input.termYears}
          ufValueCLP={input.ufValueCLP}
        />
      );
    }
    if (activeTab === 1) {
      return (
        <SavingsSensitivityPanel
          currentSavingsUF={currentSavingsUF}
          ufValueCLP={input.ufValueCLP}
          maxFinancingPct={input.maxFinancingPct}
          maxPropertyByIncomeUF={maxPropertyByIncomeUF}
        />
      );
    }
    // activeTab === 2
    return (
      <Suspense fallback={<ChartLoading />}>
        <RateMaxPropertyChart data={rateMaxData} currentRate={input.annualRatePct} />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">
          <ErrorBoundary
            key={`tab-${activeTab}-${isTargetMode}`}
            fallback={(error) => (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Este panel falló al cargar. El resto del simulador sigue disponible.
                {error?.message && (
                  <div className="mt-2 font-mono text-xs text-amber-900 break-words">{error.message}</div>
                )}
              </div>
            )}
          >
            {renderContent()}
          </ErrorBoundary>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {showTable ? "Ocultar tabla de escenarios" : "Ver tabla de escenarios"}
        </button>
        {showTable && (
          <div className="mt-3">
            <ScenarioTable
              rows={tableRows}
              ufValueCLP={input.ufValueCLP}
              highlightPropertyUF={highlightPropertyUF}
              userIncomeUF={userIncomeUF}
              userSavingsUF={userSavingsUF}
            />
          </div>
        )}
      </div>
    </div>
  );
}
