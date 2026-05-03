import type { TermPoint } from "@/lib/sensitivity";
import { Plot } from "./Plot";

type Props = { data: TermPoint[] };

const TERM_COLORS: Record<number, string> = { 15: "#ef4444", 20: "#f59e0b", 25: "#3b82f6", 30: "#10b981" };

export function TermChart({ data }: Props) {
  const terms = [...new Set(data.map((d) => d.termYears))].sort((a, b) => a - b);

  const traces = terms.map((t) => {
    const filtered = data.filter((d) => d.termYears === t);
    return {
      x: filtered.map((d) => d.propertyPriceUF),
      y: filtered.map((d) => d.requiredIncomeCLP),
      type: "scatter" as const,
      mode: "lines" as const,
      name: `${t} años`,
      line: { color: TERM_COLORS[t] ?? "#94a3b8", width: 2 },
    };
  });

  return (
    <Plot
      data={traces}
      layout={{
        title: { text: "Ingreso requerido por plazo del crédito", font: { size: 13 } },
        xaxis: { title: { text: "Precio propiedad (UF)" }, tickformat: ",.0f", gridcolor: "#f1f5f9" },
        yaxis: { title: { text: "Ingreso requerido (CLP)" }, tickformat: "$,.0f", gridcolor: "#f1f5f9" },
        legend: { orientation: "h", y: -0.2 },
        margin: { t: 40, r: 20, b: 60, l: 80 },
        plot_bgcolor: "#ffffff",
        paper_bgcolor: "#ffffff",
        font: { family: "Inter, system-ui, sans-serif", size: 11 },
        hovermode: "x unified",
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 320 }}
      useResizeHandler
    />
  );
}
