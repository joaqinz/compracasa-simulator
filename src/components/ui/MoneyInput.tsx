import { useState, useEffect, useRef } from "react";
import type { MoneyUnit } from "@/types/finance";
import { Tooltip } from "./Tooltip";

type Props = {
  label: string;
  value: number | undefined;
  unit: MoneyUnit;
  onValueChange: (value: number | undefined) => void;
  onUnitChange: (unit: MoneyUnit) => void;
  placeholder?: string;
  tooltipTermId?: string;
  min?: number;
  disabled?: boolean;
};

// Chilean convention: dots as thousand separators (2.500.000), comma as decimal (62,3)
function formatDisplay(n: number, unit: MoneyUnit): string {
  if (unit === "UF") {
    // Show up to 2 decimal places, use comma as decimal separator
    return n.toLocaleString("es-CL", { maximumFractionDigits: 2 });
  }
  return Math.round(n).toLocaleString("es-CL");
}

function parseDisplay(s: string): number | undefined {
  if (!s) return undefined;
  // Strip thousand separators (dots in es-CL) and normalise decimal comma → dot
  const normalised = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalised);
  return isNaN(n) ? undefined : n;
}

export function MoneyInput({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  placeholder,
  tooltipTermId,
  min = 0,
  disabled = false,
}: Props) {
  const [display, setDisplay] = useState(value != null ? formatDisplay(value, unit) : "");
  const focusedRef = useRef(false);

  // Sync display when value or unit changes from outside (e.g. bank preset, URL load)
  useEffect(() => {
    if (!focusedRef.current) {
      setDisplay(value != null ? formatDisplay(value, unit) : "");
    }
  }, [value, unit]);

  function handleFocus() {
    focusedRef.current = true;
    // Show bare number without thousand separators for clean editing
    const n = parseDisplay(display);
    if (n != null) {
      setDisplay(unit === "UF" ? String(n) : String(Math.round(n)));
    }
  }

  function handleBlur() {
    focusedRef.current = false;
    const n = parseDisplay(display);
    if (n != null && n >= min) {
      setDisplay(formatDisplay(n, unit));
    } else {
      setDisplay("");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value;
    if (unit === "CLP") {
      v = v.replace(/[^\d]/g, ""); // integers only for CLP
    } else {
      v = v.replace(/[^\d.,]/g, ""); // allow decimal for UF
    }
    setDisplay(v);
    const n = parseDisplay(v);
    onValueChange(n != null && n >= min ? n : undefined);
  }

  function handleUnitChange(newUnit: MoneyUnit) {
    onUnitChange(newUnit);
    // Reformat the current number for the new unit
    const n = parseDisplay(display);
    if (n != null) {
      setDisplay(focusedRef.current ? String(n) : formatDisplay(n, newUnit));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 flex items-center">
        {label}
        {tooltipTermId && <Tooltip termId={tooltipTermId} />}
      </label>
      <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <input
          type="text"
          inputMode="decimal"
          className="flex-1 px-3 py-2 text-sm bg-white focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 min-w-0"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder ?? (unit === "CLP" ? "ej. 2.500.000" : "ej. 3.500")}
          disabled={disabled}
        />
        <select
          className="px-2 py-2 text-sm bg-slate-50 border-l border-slate-300 focus:outline-none cursor-pointer"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as MoneyUnit)}
          disabled={disabled}
        >
          <option value="CLP">CLP</option>
          <option value="UF">UF</option>
        </select>
      </div>
    </div>
  );
}
