import type { RateMaxPoint } from "@/lib/sensitivity";
import { Plot } from "./Plot";

type Props = { data: RateMaxPoint[]; currentRate: number };

export function RateMaxPropertyChart({ data, currentRate }: Props) {
  if (data.length === 0 || data.every((d) => d.maxPropertyUF === 0)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
        Ingresa tu ingreso para ver cómo la tasa afecta lo que puedes comprar.
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapes: any[] = [
    {
      type: "line",
      xref: "x",
      x0: currentRate, x1: currentRate,
      yref: "paper",
      y0: 0, y1: 1,
      line: { color: "#3b82f6", width: 2, dash: "dash" },
    },
  ];

  return (
    <Plot
      data={[
        {
          x: data.map((d) => d.annualRatePct),
          y: data.map((d) => d.maxPropertyUF),
          type: "scatter",
          mode: "lines+markers",
          name: "Propiedad máxima",
          line: { color: "#8b5cf6", width: 2 },
          marker: { size: 6 },
        },
      ]}
      layout={{
        xaxis: { title: { text: "Tasa anual (%)" }, ticksuffix: "%", gridcolor: "#f1f5f9" },
        yaxis: { title: { text: "Propiedad máxima (UF)" }, ticksuffix: " UF", gridcolor: "#f1f5f9" },
        shapes,
        margin: { t: 20, r: 20, b: 60, l: 80 },
        plot_bgcolor: "#ffffff",
        paper_bgcolor: "#ffffff",
        font: { family: "Inter, system-ui, sans-serif", size: 11 },
      } as object}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 300 }}
      useResizeHandler
    />
  );
}
