import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { build2DTrace } from '../lib/mathEngine';
import { useStudioStore } from '../lib/store';

export function Graph2D() {
  const { equations, sliders, tablePoints, connectTable } = useStudioStore();

  const sliderScope = useMemo(() => Object.fromEntries(sliders.map((s) => [s.variable, s.value])), [sliders]);

  const traces = useMemo(() => {
    const equationTraces = equations
      .filter((eq) => eq.visible && eq.expression.trim())
      .map((eq) => build2DTrace(eq, sliderScope, [-20, 20]))
      .filter(Boolean);

    const tableTrace = {
      x: tablePoints.map((p) => p.x),
      y: tablePoints.map((p) => p.y),
      type: 'scatter' as const,
      mode: connectTable ? ('lines+markers' as const) : ('markers' as const),
      marker: { color: '#f0883e', size: 8 },
      line: { color: '#f0883e', width: 1.5 },
      name: 'table'
    };

    return [...equationTraces, tableTrace];
  }, [equations, sliderScope, tablePoints, connectTable]);

  return (
    <Plot
      className="h-full w-full"
      data={traces as never[]}
      useResizeHandler
      config={{ displaylogo: false, responsive: true, scrollZoom: true }}
      layout={{
        paper_bgcolor: '#0d1117',
        plot_bgcolor: '#0d1117',
        dragmode: 'pan',
        font: { color: '#c9d1d9' },
        xaxis: { gridcolor: '#30363d', zerolinecolor: '#8b949e', title: 'x' },
        yaxis: { gridcolor: '#30363d', zerolinecolor: '#8b949e', title: 'y', scaleanchor: 'x' },
        margin: { t: 10, r: 10, b: 40, l: 45 },
        legend: { orientation: 'h' }
      }}
    />
  );
}
