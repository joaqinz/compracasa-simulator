import { useState } from "react";
import glossary from "@/data/financialGlossary.json";

export function GlossarySection() {
  const [open, setOpen] = useState(false);
  const [openTerms, setOpenTerms] = useState<Set<string>>(new Set());

  function toggleTerm(id: string) {
    setOpenTerms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700"
      >
        <span>Glosario de términos financieros</span>
        <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="divide-y divide-slate-100">
          {glossary.map((term) => (
            <div key={term.id}>
              <button
                type="button"
                onClick={() => toggleTerm(term.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{term.term}</span>
                <span className="text-slate-400 text-xs ml-2">{openTerms.has(term.id) ? "▲" : "▼"}</span>
              </button>
              {openTerms.has(term.id) && (
                <p className="px-4 pb-3 text-xs text-slate-600 leading-relaxed">{term.definition}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
