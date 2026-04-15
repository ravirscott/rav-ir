import { useMemo } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import { compileExpression, evaluatePiecewise, normalizeExpression } from '../utils/mathEngine';

const Plot = createPlotlyComponent(Plotly);
if (typeof window !== 'undefined') window.Plotly = Plotly;

function parseType(raw = '') {
  const value = raw.replace(/\s/g, '').toLowerCase();
  if (value.startsWith('r=')) return 'polar';
  if (value.startsWith('x=') || value.startsWith('y=')) {
    if (value.includes('t')) return 'parametric';
    return 'cartesian';
  }
  return 'cartesian';
}

export default function Graph2D({ equations, tables, sliders, onViewChange }) {
  const traces = useMemo(() => {
    const sliderScope = Object.fromEntries(Object.entries(sliders).map(([k, v]) => [k, v.value]));
    const all = [];

    equations.filter((eq) => eq.visible && eq.expression.trim()).forEach((eq) => {
      const kind = parseType(eq.expression);
      try {
        if (kind === 'polar') {
          const expr = normalizeExpression(eq.expression);
          const fn = compileExpression(expr);
          const theta = Array.from({ length: 700 }, (_, i) => -Math.PI * 2 + (i * 4 * Math.PI) / 699);
          const r = theta.map((t) => fn.evaluate({ ...sliderScope, theta: t, t }));
          all.push({ type: 'scatterpolar', mode: 'lines', theta: theta.map((v) => (v * 180) / Math.PI), r, line: { color: eq.color, width: 2 }, name: eq.expression });
          return;
        }

        if (kind === 'parametric') {
          const [left, right] = eq.expression.split(',').map((s) => s.trim());
          const xExpr = normalizeExpression(left.replace(/^x\s*=\s*/i, ''));
          const yExpr = normalizeExpression((right || '').replace(/^y\s*=\s*/i, ''));
          const xFn = compileExpression(xExpr);
          const yFn = compileExpression(yExpr);
          const t = Array.from({ length: 700 }, (_, i) => -10 + (20 * i) / 699);
          all.push({ type: 'scatter', mode: 'lines', x: t.map((tt) => xFn.evaluate({ ...sliderScope, t: tt })), y: t.map((tt) => yFn.evaluate({ ...sliderScope, t: tt })), line: { color: eq.color, width: 2 }, name: eq.expression });
          return;
        }

        const expr = normalizeExpression(eq.expression);
        const fn = compileExpression(expr);
        const x = Array.from({ length: 900 }, (_, i) => -15 + (30 * i) / 899);
        const y = x.map((xx) => (expr.includes('{') ? evaluatePiecewise(expr, { ...sliderScope, x: xx }) : fn.evaluate({ ...sliderScope, x: xx })));
        all.push({ type: 'scatter', mode: 'lines', x, y, line: { color: eq.color, width: 2 }, name: eq.expression });
      } catch {
        all.push({ type: 'scatter', x: [], y: [], name: `${eq.expression} (invalid)` });
      }
    });

    tables.filter((t) => t.visible).forEach((table, idx) => {
      all.push({ type: 'scatter', mode: table.connect ? 'lines+markers' : 'markers', x: table.points.map((p) => p.x), y: table.points.map((p) => p.y), marker: { size: 8, color: table.color }, line: { color: table.color, dash: table.connect ? 'solid' : 'dot' }, name: `Table ${idx + 1}` });
    });

    return all;
  }, [equations, tables, sliders]);

  return (
    <Plot
      data={traces}
      onRelayout={(layout) => {
        const { 'xaxis.range[0]': xMin, 'xaxis.range[1]': xMax, 'yaxis.range[0]': yMin, 'yaxis.range[1]': yMax } = layout;
        if ([xMin, xMax, yMin, yMax].every((v) => typeof v === 'number')) onViewChange({ xMin, xMax, yMin, yMax });
      }}
      layout={{
        paper_bgcolor: '#0d1117',
        plot_bgcolor: '#0d1117',
        font: { color: '#c9d1d9' },
        dragmode: 'pan',
        margin: { l: 48, r: 24, t: 20, b: 40 },
        xaxis: { showgrid: true, gridcolor: '#30363d', zerolinecolor: '#8b949e' },
        yaxis: { showgrid: true, gridcolor: '#30363d', zerolinecolor: '#8b949e', scaleanchor: 'x', scaleratio: 1 },
        polar: { bgcolor: '#0d1117', radialaxis: { gridcolor: '#30363d' }, angularaxis: { gridcolor: '#30363d' } },
        legend: { orientation: 'h' },
      }}
      config={{ responsive: true, scrollZoom: true, displaylogo: false }}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
    />
  );
}
