import { useState } from "react";
import glossary from "@/data/financialGlossary.json";

type Props = { termId: string };

export function Tooltip({ termId }: Props) {
  const [open, setOpen] = useState(false);
  const entry = glossary.find((g) => g.id === termId);
  if (!entry) return null;

  const panelId = `tooltip-${termId}`;

  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold leading-4 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={`Información sobre ${entry.term}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        ?
      </button>
      {open && (
        <div
          id={panelId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-700 shadow-lg whitespace-normal"
        >
          <p className="mb-1 font-semibold text-slate-900">{entry.term}</p>
          <p>{entry.definition}</p>
        </div>
      )}
    </span>
  );
}
