import type { ScenarioMode } from "@/types/finance";
import clsx from "clsx";

type Props = {
  mode: ScenarioMode;
  onChange: (mode: ScenarioMode) => void;
};

const modes: { id: ScenarioMode; title: string; subtitle: string; icon: string }[] = [
  { id: "income",          title: "Sé cuánto gano",          subtitle: "¿Qué propiedad puedo pagar con mi ingreso?", icon: "💰" },
  { id: "target_property", title: "Sé el precio que quiero", subtitle: "¿Cuánto necesito ganar o ahorrar para esto?", icon: "🏡" },
];

export function ModeSelector({ mode, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">¿Qué sabes hoy?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={clsx(
              "rounded-xl border-2 px-4 py-3 text-left transition-all",
              mode === m.id
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
            )}
          >
            <span className="text-xl">{m.icon}</span>
            <p className={clsx("font-semibold text-sm mt-1", mode === m.id ? "text-blue-700" : "text-slate-800")}>
              {m.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{m.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
