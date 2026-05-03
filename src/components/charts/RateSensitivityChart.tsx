import type { RatePoint } from "@/lib/sensitivity";
import { Plot } from "./Plot";

type Props = { data: RatePoint[]; currentRate: number };

export function RateSensitivityChart({ data, currentRate }: Props) {
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
          y: data.map((d) => d.requiredIncomeCLP),
          type: "scatter",
          mode: "lines+markers",
          name: "Ingreso requerido",
          line: { color: "#8b5cf6", width: 2 },
          marker: { size: 6 },
        },
      ]}
      layout={{
        title: { text: "Sensibilidad a la tasa de interés", font: { size: 13 } },
        xaxis: { title: { text: "Tasa anual (%)" }, ticksuffix: "%", gridcolor: "#f1f5f9" },
        yaxis: { title: { text: "Ingreso requerido (CLP)" }, tickformat: "$,.0f", gridcolor: "#f1f5f9" },
        shapes,
        margin: { t: 40, r: 20, b: 60, l: 80 },
        plot_bgcolor: "#ffffff",
        paper_bgcolor: "#ffffff",
        font: { family: "Inter, system-ui, sans-serif", size: 11 },
      } as object}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 320 }}
      useResizeHandler
    />
  );
}
