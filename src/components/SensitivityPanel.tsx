import { lazy, Suspense, useState } from "react";
import type { ScenarioInput, SensitivityRow } from "@/types/finance";
import type {
  AffordabilityPoint,
  TermPoint,
  RatePoint,
  HeatmapData,
  PieRatePoint,
} from "@/lib/sensitivity";
import { ScenarioTable } from "./ScenarioTable";
import { PieRateSensitivityTable } from "./PieRateSensitivityTable";
import { ErrorBoundary } from "./ui/ErrorBoundary";

type Props = {
  affordabilityData: AffordabilityPoint[];
  termData: TermPoint[];
  rateData: RatePoint[];
  heatmapData: HeatmapData;
  pieRateData: PieRatePoint[];
  tableRows: SensitivityRow[];
  input: ScenarioInput;
  highlightPropertyUF?: number;
};

const incomeTabs = ["Ingreso vs Precio", "Plazo", "Sensibilidad Tasa", "Mapa de calor"];
const targetTabs = ["Pie vs Tasa", "Sensibilidad Tasa"];
const AffordabilityChart = lazy(() =>
  import("./charts/AffordabilityChart").then((m) => ({ default: m.AffordabilityChart }))
);
const TermChart = lazy(() =>
  import("./charts/TermChart").then((m) => ({ default: m.TermChart }))
);
const RateSensitivityChart = lazy(() =>
  import("./charts/RateSensitivityChart").then((m) => ({ default: m.RateSensitivityChart }))
);
const HeatmapChart = lazy(() =>
  import("./charts/HeatmapChart").then((m) => ({ default: m.HeatmapChart }))
);

function ChartUnavailable({ activeTab }: { activeTab: number }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Los graficos estan temporalmente deshabilitados mientras estabilizamos la integracion de Plotly.
      {activeTab === 0 && <div className="mt-2">Usa la tabla de escenarios de abajo para revisar los valores calculados.</div>}
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      Cargando grafico de prueba...
    </div>
  );
}

export function SensitivityPanel({
  affordabilityData,
  termData,
  rateData,
  heatmapData,
  pieRateData,
  tableRows,
  input,
  highlightPropertyUF,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTable, setShowTable] = useState(true);
  const isTargetMode = input.mode === "target_property";
  const tabs = isTargetMode ? targetTabs : incomeTabs;

  const userIncomeCLP =
    input.netMonthlyIncomeAmount != null
      ? input.netMonthlyIncomeUnit === "CLP"
        ? input.netMonthlyIncomeAmount
        : input.netMonthlyIncomeAmount * input.ufValueCLP
      : undefined;

  function renderActiveChart() {
    if (isTargetMode) {
      if (activeTab === 0) {
        return (
          <PieRateSensitivityTable
            data={pieRateData}
            ufValueCLP={input.ufValueCLP}
            hasIncome={input.netMonthlyIncomeAmount != null}
          />
        );
      }
      // activeTab === 1 → rate sensitivity for the fixed target price
      return rateData.length > 0
        ? <RateSensitivityChart data={rateData} currentRate={input.annualRatePct} />
        : <ChartUnavailable activeTab={activeTab} />;
    }

    // income mode tabs
    if (activeTab === 0) {
      return <AffordabilityChart data={affordabilityData} input={input} />;
    }
    if (activeTab === 1) {
      return termData.length > 0 ? <TermChart data={termData} /> : <ChartUnavailable activeTab={activeTab} />;
    }
    if (activeTab === 2) {
      return rateData.length > 0
        ? <RateSensitivityChart data={rateData} currentRate={input.annualRatePct} />
        : <ChartUnavailable activeTab={activeTab} />;
    }
    if (activeTab === 3) {
      return heatmapData.x.length > 0
        ? <HeatmapChart data={heatmapData} userIncomeCLP={userIncomeCLP} />
        : <ChartUnavailable activeTab={activeTab} />;
    }

    return <ChartUnavailable activeTab={activeTab} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(Math.min(i, tabs.length - 1))}
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
            key={`chart-${activeTab}`}
            fallback={(error) => (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                El grafico de esta pestaña fallo al cargar. El resto del simulador sigue disponible.
                {error?.message && (
                  <div className="mt-2 font-mono text-xs text-amber-900 break-words">
                    {error.message}
                  </div>
                )}
              </div>
            )}
          >
            <Suspense fallback={<ChartLoading />}>
              {renderActiveChart()}
            </Suspense>
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
