import createPlotlyComponentModule from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

const createPlotlyComponentSource = createPlotlyComponentModule as any;
const createPlotlyComponent =
  typeof createPlotlyComponentSource === "function"
    ? createPlotlyComponentSource
    : createPlotlyComponentSource.default;

export const Plot = createPlotlyComponent(Plotly);
