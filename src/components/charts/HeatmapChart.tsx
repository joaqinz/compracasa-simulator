import type { HeatmapData } from "@/lib/sensitivity";
import { Plot } from "./Plot";

type Props = { data: HeatmapData; userIncomeCLP?: number };

export function HeatmapChart({ data, userIncomeCLP: _userIncomeCLP }: Props) {
  return (
    <Plot
      data={[
        {
          type: "heatmap",
          x: data.x,
          y: data.y.map((v) => `${v}%`),
          z: data.z,
          colorscale: [
            [0, "#10b981"],
            [0.4, "#86efac"],
            [0.6, "#fde68a"],
            [0.8, "#fca5a5"],
            [1, "#ef4444"],
          ],
          hovertemplate: "Propiedad: %{x} UF<br>Pie: %{y}<br>Ingreso req.: %{z:$,.0f}<extra></extra>",
          colorbar: {
            title: { text: "Ingreso req. (CLP)", side: "right" },
            tickformat: "$,.0f",
          },
          zsmooth: "best",
        } as object,
      ]}
      layout={{
        title: { text: "Ingreso requerido: propiedad × pie", font: { size: 13 } },
        xaxis: { title: { text: "Precio propiedad (UF)" }, gridcolor: "#f1f5f9" },
        yaxis: { title: { text: "Pie (%)" } },
        margin: { t: 40, r: 20, b: 60, l: 60 },
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
