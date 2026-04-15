import { useEffect, useMemo } from 'react';
import TopBar from './components/TopBar';
import EquationList from './components/EquationList';
import SliderPanel from './components/SliderPanel';
import TablePanel from './components/TablePanel';
import Graph2D from './components/Graph2D';
import Graph3D from './components/Graph3D';
import GeometryBoard from './components/GeometryBoard';
import { useStudioStore } from './store';

function encodeState(state) {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

function decodeState(value) {
  return JSON.parse(decodeURIComponent(atob(value)));
}

export default function App() {
  const equations = useStudioStore((s) => s.equations);
  const tables = useStudioStore((s) => s.tables);
  const sliders = useStudioStore((s) => s.sliders);
  const mode = useStudioStore((s) => s.mode);
  const graphView = useStudioStore((s) => s.graphView);
  const setGraphView = useStudioStore((s) => s.setGraphView);
  const loadSharedState = useStudioStore((s) => s.loadSharedState);

  const shareableState = useMemo(() => ({ equations, tables, sliders, mode, graphView }), [equations, tables, sliders, mode, graphView]);

  const onShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('state', encodeState(shareableState));
    navigator.clipboard.writeText(url.toString());
    alert('Shareable link copied to clipboard.');
  };

  const onExport = async () => {
    const plotNode = document.querySelector('.js-plotly-plot');
    if (plotNode && window.Plotly) {
      await window.Plotly.downloadImage(plotNode, { format: 'png', filename: 'ravir-math-studio', width: 1400, height: 900 });
      return;
    }
    alert('PNG export is available in 2D graph mode.');
  };

  useEffect(() => {
    const encoded = new URL(window.location.href).searchParams.get('state');
    if (encoded) {
      try {
        loadSharedState(decodeState(encoded));
      } catch {
        // invalid share link ignored
      }
    }
  }, [loadSharedState]);

  return (
    <div className="app-shell">
      <TopBar onExport={onExport} onShare={onShare} />
      <main className="workspace">
        <aside className="left-panel">
          <EquationList />
          <SliderPanel />
          <TablePanel />
        </aside>
        <section className="graph-panel">
          {mode === 'graph2d' && <Graph2D equations={equations} tables={tables} sliders={sliders} onViewChange={setGraphView} />}
          {mode === 'graph3d' && <Graph3D equations={equations} sliders={sliders} />}
          {mode === 'geometry' && <GeometryBoard />}
        </section>
      </main>
    </div>
  );
}
