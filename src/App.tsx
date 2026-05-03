import { useReducer, useEffect, useMemo } from "react";
import type { ScenarioInput, UFMetadata } from "@/types/finance";
import defaults from "@/data/defaultAssumptions.json";
import { runScenario, deriveAffordabilityStatus } from "@/lib/affordability";
import {
  generateRateSensitivity,
  generateSensitivityTable,
  generatePieRateSensitivity,
  generateTermMaxProperty,
  generateRateMaxProperty,
} from "@/lib/sensitivity";
import { getUFValue } from "@/lib/ufService";
import { encodeScenarioToURL, decodeScenarioFromURL } from "@/lib/urlParams";
import { toUF } from "@/lib/money";
import { firstBankPreset } from "@/lib/bankPresets";

const FINE_RATE_OFFSETS = Array.from({ length: 41 }, (_, i) =>
  parseFloat((-1.0 + i * 0.05).toFixed(2))
);

import { UFStatusBar } from "@/components/UFStatusBar";
import { ModeSelector } from "@/components/ModeSelector";
import { InputPanel } from "@/components/InputPanel";
import { ResultCards } from "@/components/ResultCards";
import { SensitivityPanel } from "@/components/SensitivityPanel";
import { GlossarySection } from "@/components/GlossarySection";
import { DisclaimerSection } from "@/components/DisclaimerSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const defaultScenario: ScenarioInput = {
  mode: "income",
  ufValueCLP: defaults.ufFallbackCLP,
  netMonthlyIncomeAmount: undefined,
  netMonthlyIncomeUnit: "CLP",
  savingsAmount: undefined,
  savingsUnit: "CLP",
  targetPropertyAmount: undefined,
  targetPropertyUnit: "UF",
  termYears: defaults.termYears,
  downPaymentPct: defaults.downPaymentPct,
  annualRatePct: defaults.annualRatePct,
  caePct: defaults.caePct,
  monthlyInsuranceUF: defaults.monthlyInsuranceUF,
  maxDividendIncomeRatioPct: defaults.maxDividendIncomeRatioPct,
  maxFinancingPct: defaults.maxFinancingPct,
  displayUnit: defaults.displayUnit as "BOTH",
  selectedBankId: firstBankPreset.bankId,
};

type AppState = {
  scenario: ScenarioInput;
  ufMetadata: UFMetadata | null;
  ufLoading: boolean;
  ufError: boolean;
};

type Action =
  | { type: "UPDATE_SCENARIO"; patch: Partial<ScenarioInput> }
  | { type: "SET_UF"; metadata: UFMetadata }
  | { type: "SET_UF_LOADING" }
  | { type: "SET_UF_ERROR" }
  | { type: "LOAD_FROM_URL"; patch: Partial<ScenarioInput> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "UPDATE_SCENARIO":
    case "LOAD_FROM_URL":
      return { ...state, scenario: { ...state.scenario, ...action.patch } };
    case "SET_UF_LOADING":
      return { ...state, ufLoading: true, ufError: false };
    case "SET_UF":
      return {
        ...state,
        ufMetadata: action.metadata,
        ufLoading: false,
        ufError: false,
        scenario: { ...state.scenario, ufValueCLP: action.metadata.valueCLP },
      };
    case "SET_UF_ERROR":
      return { ...state, ufLoading: false, ufError: true };
  }
}

const initialState: AppState = {
  scenario: defaultScenario,
  ufMetadata: null,
  ufLoading: true,
  ufError: false,
};

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { scenario, ufMetadata, ufLoading, ufError } = state;

  useEffect(() => {
    if (window.location.search) {
      const patch = decodeScenarioFromURL(window.location.search);
      dispatch({ type: "LOAD_FROM_URL", patch });
    }
  }, []);

  useEffect(() => {
    dispatch({ type: "SET_UF_LOADING" });
    getUFValue().then((meta) => {
      dispatch({ type: "SET_UF", metadata: meta });
    }).catch(() => {
      dispatch({ type: "SET_UF_ERROR" });
    });
  }, []);

  function handleChange(patch: Partial<ScenarioInput>) {
    dispatch({ type: "UPDATE_SCENARIO", patch: syncSavingsPie(patch, scenario, output) });
  }

  function syncSavingsPie(
    patch: Partial<ScenarioInput>,
    current: ScenarioInput,
    out: typeof output
  ): Partial<ScenarioInput> {
    if (current.mode !== "income") return patch;
    if (!out.maxPropertyByIncomeUF || out.maxPropertyByIncomeUF <= 0) return patch;

    const maxLoanUF = out.maxPropertyByIncomeUF * (1 - current.downPaymentPct / 100);
    const savingsChanged = ("savingsAmount" in patch || "savingsUnit" in patch) && !("downPaymentPct" in patch);
    const pieChanged = "downPaymentPct" in patch && !("savingsAmount" in patch);

    if (savingsChanged) {
      const amount = patch.savingsAmount ?? current.savingsAmount;
      const unit = patch.savingsUnit ?? current.savingsUnit;
      if (amount != null && amount > 0) {
        const savingsUF = unit === "UF" ? amount : amount / current.ufValueCLP;
        const rawPct = (savingsUF / (maxLoanUF + savingsUF)) * 100;
        const clamped = Math.max(10, Math.min(40, Math.round(rawPct / 5) * 5));
        return { ...patch, downPaymentPct: clamped };
      }
    }

    if (pieChanged) {
      const newPie = patch.downPaymentPct!;
      const newMaxPropertyUF = maxLoanUF / (1 - newPie / 100);
      const impliedSavingsCLP = Math.round(newMaxPropertyUF * (newPie / 100) * current.ufValueCLP);
      return { ...patch, savingsAmount: impliedSavingsCLP, savingsUnit: "CLP" };
    }

    return patch;
  }

  function handleManualUF(value: number) {
    dispatch({
      type: "SET_UF",
      metadata: { valueCLP: value, date: new Date().toISOString().split("T")[0], source: "Manual" },
    });
  }

  function handleCopyScenario() {
    const url = encodeScenarioToURL(scenario);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert("¡Enlace copiado al portapapeles!"));
    } else {
      window.prompt("Copia este enlace:", url);
    }
  }

  const output = useMemo(() => runScenario(scenario), [scenario]);
  const status = useMemo(() => deriveAffordabilityStatus(output, scenario), [output, scenario]);

  const targetPropertyUF = useMemo(
    () => scenario.targetPropertyAmount != null
      ? toUF(scenario.targetPropertyAmount, scenario.targetPropertyUnit, scenario.ufValueCLP)
      : 3000,
    [scenario.targetPropertyAmount, scenario.targetPropertyUnit, scenario.ufValueCLP]
  );

  // ── Income mode: "push a little" sensitivity ──────────────────────────────
  const incomeModeDeps = [
    scenario.annualRatePct, scenario.termYears, scenario.downPaymentPct,
    scenario.monthlyInsuranceUF, scenario.maxDividendIncomeRatioPct,
    scenario.maxFinancingPct, scenario.ufValueCLP,
    scenario.netMonthlyIncomeAmount, scenario.netMonthlyIncomeUnit,
    scenario.savingsAmount, scenario.savingsUnit,
  ] as const; // eslint-disable-line react-hooks/exhaustive-deps

  const termMaxData = useMemo(
    () => scenario.mode === "income"
      ? generateTermMaxProperty(scenario, defaults.sensitivityTerms)
      : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario.mode, ...incomeModeDeps]
  );

  const rateMaxData = useMemo(
    () => scenario.mode === "income"
      ? generateRateMaxProperty(scenario, defaults.sensitivityRateOffsets)
      : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario.mode, ...incomeModeDeps]
  );

  // ── Target property mode ──────────────────────────────────────────────────
  const rateData = useMemo(
    () => scenario.mode === "target_property"
      ? generateRateSensitivity(scenario, FINE_RATE_OFFSETS, targetPropertyUF)
      : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario.mode, scenario.annualRatePct, scenario.termYears, scenario.downPaymentPct,
     scenario.monthlyInsuranceUF, scenario.maxDividendIncomeRatioPct, scenario.ufValueCLP, targetPropertyUF]
  );

  const pieRateData = useMemo(() => {
    if (scenario.mode !== "target_property") return [];
    const rates = defaults.sensitivityRateOffsets.map((o) => Math.max(0.1, scenario.annualRatePct + o));
    return generatePieRateSensitivity(scenario, targetPropertyUF, [10, 15, 20, 25, 30], rates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.mode, scenario.annualRatePct, scenario.termYears, scenario.monthlyInsuranceUF,
      scenario.maxDividendIncomeRatioPct, scenario.maxFinancingPct, scenario.ufValueCLP,
      scenario.netMonthlyIncomeAmount, scenario.netMonthlyIncomeUnit, targetPropertyUF]);

  // ── Shared scenario table ─────────────────────────────────────────────────
  const tableRows = useMemo(() => {
    const prices = Array.from({ length: 12 }, (_, i) => 1000 + i * 500);
    return generateSensitivityTable(scenario, prices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.annualRatePct, scenario.termYears, scenario.downPaymentPct,
      scenario.monthlyInsuranceUF, scenario.maxDividendIncomeRatioPct,
      scenario.maxFinancingPct, scenario.ufValueCLP,
      scenario.netMonthlyIncomeAmount, scenario.netMonthlyIncomeUnit]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UFStatusBar
        metadata={ufMetadata}
        loading={ufLoading}
        error={ufError}
        onManualOverride={handleManualUF}
      />

      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Simulador Hipotecario Chile</h1>
              <p className="text-sm text-slate-500 mt-0.5">Simulador chileno de capacidad hipotecaria en UF</p>
            </div>
            <button
              type="button"
              onClick={handleCopyScenario}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              🔗 Compartir escenario
            </button>
          </div>
          <div className="mt-4">
            <ModeSelector mode={scenario.mode} onChange={(mode) => handleChange({ mode })} />
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <InputPanel scenario={scenario} onChange={handleChange} />
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <ResultCards output={output} input={scenario} status={status} />
        <ErrorBoundary>
          <SensitivityPanel
            key={scenario.mode}
            termMaxData={termMaxData}
            rateMaxData={rateMaxData}
            maxPropertyByIncomeUF={output.maxPropertyByIncomeUF}
            rateData={rateData}
            pieRateData={pieRateData}
            targetPropertyUF={targetPropertyUF}
            tableRows={tableRows}
            input={scenario}
            highlightPropertyUF={output.realisticMaxPropertyUF ?? output.propertyPriceUF}
          />
        </ErrorBoundary>
        <GlossarySection />
        <DisclaimerSection />
      </main>
    </div>
  );
}

export default App;
