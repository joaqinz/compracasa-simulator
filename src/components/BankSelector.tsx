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
  const nonManualPresets = bankPresets.filter((bank) => bank.bankId !== "manual");
  const typicalMin = 20;
  const typicalMax = 30;
  const typicalStartPct = ((typicalMin - 15) / (40 - 15)) * 100;
  const typicalEndPct = ((typicalMax - 15) / (40 - 15)) * 100;
  const sliderProgressPct = ((maxDividendIncomeRatioPct - 15) / (40 - 15)) * 100;

  function handleBankChange(bankId: string) {
    if (bankId === "manual") {
      onChange({ selectedBankId: "manual" });
      return;
    }

    const preset = resolveBankTermPreset(bankId, termYears);
    if (!preset) return;

    onChange({
      selectedBankId: preset.bank.bankId,
      annualRatePct: preset.term.annualRatePct,
      caePct: preset.term.caePct,
      monthlyInsuranceUF: preset.term.monthlyInsuranceUF,
      maxFinancingPct: preset.bank.maxFinancingPct,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Banco / Escenario</label>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedBankId}
          onChange={(event) => handleBankChange(event.target.value)}
        >
          {nonManualPresets.map((bank) => (
            <option key={bank.bankId} value={bank.bankId}>
              {bank.bankName}
            </option>
          ))}
          <option value="manual">Ingreso manual</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="flex items-center text-xs font-medium text-slate-600">
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
              onChange={(event) => onChange({ annualRatePct: parseFloat(event.target.value) || 0 })}
            />
          ) : (
            <p className="py-1.5 text-sm font-semibold text-slate-800">{annualRatePct}%</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center text-xs font-medium text-slate-600">
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
              onChange={(event) => onChange({ caePct: parseFloat(event.target.value) || 0 })}
            />
          ) : (
            <p className="py-1.5 text-sm font-semibold text-slate-800">{caePct}%</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center text-xs font-medium text-slate-600">
            Seguro mensual (UF) <Tooltip termId="seguro-desgravamen" />
          </label>
          {isManual ? (
            <input
              type="number"
              step="0.01"
              min="0"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={monthlyInsuranceUF}
              onChange={(event) => onChange({ monthlyInsuranceUF: parseFloat(event.target.value) || 0 })}
            />
          ) : (
            <p className="py-1.5 text-sm font-semibold text-slate-800">{monthlyInsuranceUF} UF</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Plazos</label>
          <p className="py-1.5 text-sm font-semibold text-slate-800">
            {selectedBank?.availableTermsYears.join(", ") ?? "15, 20, 25, 30"} años
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
          Financiamiento máximo <Tooltip termId="financiamiento-maximo" />
        </div>
        {isManual ? (
          <input
            type="number"
            step="1"
            min="50"
            max="100"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={maxFinancingPct}
            onChange={(event) => onChange({ maxFinancingPct: parseFloat(event.target.value) || 80 })}
          />
        ) : (
          <p className="mt-1 text-lg font-bold text-slate-900">{maxFinancingPct}%</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          El banco financia hasta el {maxFinancingPct}% del valor de la propiedad. El resto debe salir de tu pie.
        </p>
      </div>

      {!isManual && selectedBank && selectedTermPreset && (
        <div className="flex flex-col gap-1 text-[10px] text-slate-400">
          {selectedTermPreset.termYears === termYears ? (
            <p>
              Tasas CMF para {selectedTermPreset.termYears} años: {selectedTermPreset.lastUpdated}. Fuente:{" "}
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
              No hay escenario CMF para {termYears} años en este banco. Se muestra como referencia el disponible más
              cercano: {selectedTermPreset.termYears} años.
            </p>
          )}
          <p>
            Escenarios disponibles para este banco: {selectedBank.availableTermsYears.join(", ")} años.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="flex items-center text-xs font-medium text-slate-600">
          Carga financiera máxima <Tooltip termId="carga-financiera" />
        </label>
        <p className="text-[11px] text-slate-500">
          Los bancos suelen exigir ≤25%. Subirlo asume que tu banco lo permite.
        </p>
        <div className="relative rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div
            className="pointer-events-none absolute left-3 right-3 top-[22px] h-2 rounded-full bg-slate-100"
            aria-hidden="true"
          >
            <div
              className="absolute h-full rounded-full bg-emerald-100"
              style={{
                left: `${typicalStartPct}%`,
                width: `${typicalEndPct - typicalStartPct}%`,
              }}
            />
            <div
              className="absolute h-full rounded-full bg-blue-200/70"
              style={{ width: `${sliderProgressPct}%` }}
            />
          </div>
          <input
            type="range"
            min="15"
            max="40"
            step="1"
            className="relative z-10 w-full accent-blue-600"
            value={maxDividendIncomeRatioPct}
            onChange={(event) => onChange({ maxDividendIncomeRatioPct: parseInt(event.target.value, 10) })}
            aria-label="Carga financiera máxima"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>15%</span>
            <span className="font-semibold text-slate-800">{maxDividendIncomeRatioPct}%</span>
            <span>40%</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Rango típico sombreado: 20% a 30% del ingreso neto.</p>
        </div>
      </div>
    </div>
  );
}
