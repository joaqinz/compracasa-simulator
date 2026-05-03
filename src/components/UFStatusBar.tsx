import { useState } from "react";
import type { UFMetadata } from "@/types/finance";

type Props = {
  metadata: UFMetadata | null;
  loading: boolean;
  error: boolean;
  onManualOverride: (value: number) => void;
};

export function UFStatusBar({ metadata, loading, error, onManualOverride }: Props) {
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseFloat(manualInput.replace(",", "."));
    if (!isNaN(v) && v > 0) {
      onManualOverride(v);
      setShowManual(false);
    }
  }

  const ufFormatted = metadata?.valueCLP
    ? new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metadata.valueCLP)
    : null;

  return (
    <div className="bg-slate-800 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      {loading && (
        <span className="flex items-center gap-1">
          <span className="animate-spin inline-block w-3 h-3 border border-slate-400 border-t-transparent rounded-full" />
          Obteniendo valor UF…
        </span>
      )}

      {!loading && metadata && !error && (
        <span className="flex items-center gap-1">
          <span className={metadata.source === "Fallback" ? "text-amber-400" : "text-emerald-400"}>●</span>
          UF {metadata.date}: <strong className="text-white ml-1">${ufFormatted}</strong>
          <span className="text-slate-400 ml-1">
            (Fuente: {
              metadata.source === "SII"
                ? "SII"
                : metadata.source === "Mindicador"
                  ? "mindicador.cl"
                  : metadata.source === "Manual"
                    ? "Manual"
                    : "Valor de respaldo"
            })
          </span>
        </span>
      )}

      {!loading && (error || metadata?.source === "Fallback") && (
        <span className="text-amber-300 flex items-center gap-1">
          ⚠ No se pudo obtener UF automáticamente.
        </span>
      )}

      {!showManual ? (
        <button
          type="button"
          className="text-slate-400 hover:text-white underline"
          onClick={() => setShowManual(true)}
        >
          {metadata?.source === "Manual" ? "Cambiar UF" : "Ingresar UF manualmente"}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            className="bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-500 w-28 focus:outline-none focus:border-blue-400"
            placeholder="ej. 40160,14"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="text-blue-400 hover:text-blue-300 text-xs">
            Aplicar
          </button>
          <button type="button" className="text-slate-400 hover:text-white text-xs" onClick={() => setShowManual(false)}>
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
