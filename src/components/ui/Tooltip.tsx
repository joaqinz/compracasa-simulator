import { useState } from "react";
import glossary from "@/data/financialGlossary.json";

type Props = { termId: string };

export function Tooltip({ termId }: Props) {
  const [open, setOpen] = useState(false);
  const entry = glossary.find((g) => g.id === termId);
  if (!entry) return null;

  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold leading-4 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={`Información sobre ${entry.term}`}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs text-slate-700 text-left whitespace-normal">
          <p className="font-semibold text-slate-900 mb-1">{entry.term}</p>
          <p>{entry.definition}</p>
        </div>
      )}
    </span>
  );
}
