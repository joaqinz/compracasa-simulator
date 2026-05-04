import type { ComponentType } from "react";
import createPlotlyComponentModule from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

type PlotlyComponentProps = Record<string, unknown>;
type PlotlyFactory = (plotly: typeof Plotly) => ComponentType<PlotlyComponentProps>;
type PlotlyFactoryModule = {
  default: PlotlyFactory;
};

const createPlotlyComponentSource = createPlotlyComponentModule as unknown;

const createPlotlyComponent: PlotlyFactory =
  typeof createPlotlyComponentSource === "function"
    ? (createPlotlyComponentSource as PlotlyFactory)
    : (createPlotlyComponentSource as PlotlyFactoryModule).default;

export const Plot = createPlotlyComponent(Plotly);
