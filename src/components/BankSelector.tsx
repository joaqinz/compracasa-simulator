import { bankPresets, resolveBankTermPreset } from "@/lib/bankPresets";
import { Tooltip } from "./ui/Tooltip";

type Props = {
  selectedBankId: string;
  termYears: number;
  annualRatePct: number;
  caePct: number;
  monthlyInsuranceUF: number;
  maxFinancingPct: number;
  maxDividendIncomeRatioPct: number;
  onChange: (patch: Partial<{
    selectedBankId: string;
    termYears: number;
    annualRatePct: number;
    caePct: number;
    monthlyInsuranceUF: number;
    maxFinancingPct: number;
    maxDividendIncomeRatioPct: number;
  }>) => void;
};

export function BankSelector({
  selectedBankId,
  termYears,
  annualRatePct,
  caePct,
  monthlyInsuranceUF,
  maxFinancingPct,
  maxDividendIncomeRatioPct,
  onChange,
}: Props) {
  const isManual = selectedBankId === "manual";
  const selectedPreset = resolveBankTermPreset(selectedBankId, termYears);
  const selectedBank = selectedPreset?.bank;
  const selectedTermPreset = selectedPreset?.term;
  const nonManualPresets = bankPresets.filter((b) => b.bankId !== "manual");

  function handleBankChange(bankId: string) {
    if (bankId === "manual") {
      onChange({ selectedBankId: "manual" });
      return;
    }

    const preset = resolveBankTermPreset(bankId, termYears);
    if (preset) {
      onChange({
        selectedBankId: preset.bank.bankId,
        annualRatePct: preset.term.annualRatePct,
        caePct: preset.term.caePct,
        monthlyInsuranceUF: preset.term.monthlyInsuranceUF,
        maxFinancingPct: preset.bank.maxFinancingPct,
        maxDividendIncomeRatioPct: preset.bank.maxDividendIncomeRatioPct,
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Banco / Escenario</label>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedBankId}
          onChange={(e) => handleBankChange(e.target.value)}
        >
          {nonManualPresets.map((b) => (
            <option key={b.bankId} value={b.bankId}>{b.bankName}</option>
          ))}
          <option value="manual">Ingreso manual</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 flex items-center">
            Tasa anual <Tooltip termId="tasa" />
          </label>
          {isManual ? (
            <input
              type="number"
              step="0.01"
              min="0"
              max="30"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={annualRatePct}
              onChange={(e) => onChange({ annualRatePct: parseFloat(e.target.value) || 0 })}
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 py-1.5">{annualRatePct}%</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 flex items-center">
            CAE <Tooltip termId="cae" />
          </label>
          {isManual ? (
            <input
              type="number"
              step="0.01"
              min="0"
              max="30"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={caePct}
              onChange={(e) => onChange({ caePct: parseFloat(e.target.value) || 0 })}
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 py-1.5">{caePct}%</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 flex items-center">
            Seguro mensual (UF) <Tooltip termId="seguro-desgravamen" />
          </label>
          {isManual ? (
            <input
              type="number"
              step="0.01"
              min="0"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={monthlyInsuranceUF}
              onChange={(e) => onChange({ monthlyInsuranceUF: parseFloat(e.target.value) || 0 })}
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 py-1.5">{monthlyInsuranceUF} UF</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 flex items-center">
            Financiamiento max. <Tooltip termId="financiamiento-maximo" />
          </label>
          {isManual ? (
            <input
              type="number"
              step="1"
              min="50"
              max="100"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={maxFinancingPct}
              onChange={(e) => onChange({ maxFinancingPct: parseFloat(e.target.value) || 80 })}
            />
          ) : (
            <p className="text-sm font-semibold text-slate-800 py-1.5">{maxFinancingPct}%</p>
          )}
        </div>
      </div>

      {!isManual && selectedBank && selectedTermPreset && (
        <div className="text-[10px] text-slate-400 flex flex-col gap-1">
          {selectedTermPreset.termYears === termYears ? (
            <p>
              Tasas CMF para {selectedTermPreset.termYears} anos: {selectedTermPreset.lastUpdated} - Fuente:{" "}
              <a
                href={selectedTermPreset.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-600"
              >
                CMF Simulador Hipotecario
              </a>
              . Valores referenciales.
            </p>
          ) : (
            <p>
              No hay escenario CMF para {termYears} anos en este banco. Mostrando como referencia el disponible mas
              cercano: {selectedTermPreset.termYears} anos.
            </p>
          )}
          <p>Escenarios disponibles para este banco: {selectedBank.availableTermsYears.join(", ")} anos.</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600 flex items-center">
          Carga financiera maxima <Tooltip termId="carga-financiera" />
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="15"
            max="40"
            step="1"
            className="flex-1"
            value={maxDividendIncomeRatioPct}
            onChange={(e) => onChange({ maxDividendIncomeRatioPct: parseInt(e.target.value) })}
          />
          <span className="text-sm font-semibold text-slate-800 w-10 text-right">{maxDividendIncomeRatioPct}%</span>
        </div>
      </div>
    </div>
  );
}
