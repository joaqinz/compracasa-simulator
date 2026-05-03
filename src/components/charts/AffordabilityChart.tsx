import type { AffordabilityPoint } from "@/lib/sensitivity";
import type { ScenarioInput } from "@/types/finance";
import { toUF } from "@/lib/money";
import { Plot } from "./Plot";

type Props = {
  data: AffordabilityPoint[];
  input: ScenarioInput;
};

const DP_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AffordabilityChart({ data, input }: Props) {
  const downPaymentPcts = [...new Set(data.map((d) => d.downPaymentPct))].sort((a, b) => a - b);

  const traces = downPaymentPcts.map((dp, i) => {
    const filtered = data.filter((d) => d.downPaymentPct === dp);
    return {
      x: filtered.map((d) => d.propertyPriceUF),
      y: filtered.map((d) => d.requiredIncomeCLP),
      type: "scatter" as const,
      mode: "lines" as const,
      name: `Pie ${dp}%`,
      line: { color: DP_COLORS[i % DP_COLORS.length], width: 2 },
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapes: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const annotations: any[] = [];

  if (input.netMonthlyIncomeAmount != null) {
    const incomeCLP =
      input.netMonthlyIncomeUnit === "CLP"
        ? input.netMonthlyIncomeAmount
        : input.netMonthlyIncomeAmount * input.ufValueCLP;
    shapes.push({
      type: "line",
      xref: "paper",
      x0: 0, x1: 1,
      yref: "y",
      y0: incomeCLP, y1: incomeCLP,
      line: { color: "#10b981", width: 2, dash: "dash" },
    });
    annotations.push({
      xref: "paper", x: 1.01,
      yref: "y", y: incomeCLP,
      text: "Tu ingreso",
      showarrow: false,
      font: { size: 10, color: "#10b981" },
      xanchor: "left",
    });
  }

  if (input.mode === "target_property" && input.targetPropertyAmount != null) {
    const propUF = toUF(input.targetPropertyAmount, input.targetPropertyUnit, input.ufValueCLP);
    shapes.push({
      type: "line",
      xref: "x",
      x0: propUF, x1: propUF,
      yref: "paper",
      y0: 0, y1: 1,
      line: { color: "#f59e0b", width: 2, dash: "dot" },
    });
  }

  return (
    <Plot
      data={traces}
      layout={{
        title: { text: "Ingreso requerido según precio de propiedad", font: { size: 13 } },
        xaxis: { title: { text: "Precio propiedad (UF)" }, tickformat: ",.0f", gridcolor: "#f1f5f9" },
        yaxis: { title: { text: "Ingreso mensual neto requerido (CLP)" }, tickformat: "$,.0f", gridcolor: "#f1f5f9" },
        legend: { orientation: "h", y: -0.2 },
        shapes,
        annotations,
        margin: { t: 40, r: 80, b: 60, l: 80 },
        plot_bgcolor: "#ffffff",
        paper_bgcolor: "#ffffff",
        font: { family: "Inter, system-ui, sans-serif", size: 11 },
        hovermode: "x unified",
      } as object}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 320 }}
      useResizeHandler
    />
  );
}
