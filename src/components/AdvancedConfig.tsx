import { useState } from "react";
import type { ScenarioInput } from "@/types/finance";
import { Tooltip } from "./ui/Tooltip";

type Props = {
  scenario: ScenarioInput;
  onChange: (patch: Partial<ScenarioInput>) => void;
};

export function AdvancedConfig({ scenario, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700"
      >
        <span>Configuración avanzada</span>
        <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 py-4 flex flex-col gap-4 bg-white">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 flex items-center">
              Pie (%) <Tooltip termId="pie" />
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                className="flex-1"
                value={scenario.downPaymentPct}
                onChange={(e) => onChange({ downPaymentPct: parseInt(e.target.value) })}
              />
              <span className="text-sm font-semibold text-slate-800 w-10 text-right">{scenario.downPaymentPct}%</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              {[10, 15, 20, 25, 30, 35, 40].map((v) => <span key={v}>{v}%</span>)}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t pt-3">
            <p>Los valores avanzados afectan el cálculo pero no son visibles en el resumen principal.</p>
          </div>
        </div>
      )}
    </div>
  );
}
