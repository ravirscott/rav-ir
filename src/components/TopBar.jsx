import { useStudioStore } from '../store';

export default function TopBar({ onExport, onShare }) {
  const resetProject = useStudioStore((s) => s.resetProject);
  const mode = useStudioStore((s) => s.mode);
  const setMode = useStudioStore((s) => s.setMode);

  return (
    <header className="topbar">
      <div className="brand">
        <h1>Ravir Math Studio</h1>
        <p>Interactive graphing, geometry, and math art</p>
      </div>
      <div className="toolbar">
        <div className="mode-switch">
          {[
            ['graph2d', '2D'],
            ['graph3d', '3D'],
            ['geometry', 'Geometry'],
          ].map(([value, label]) => (
            <button key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={onExport}>Export PNG</button>
        <button onClick={onShare}>Share</button>
        <button className="danger" onClick={resetProject}>
          Reset
        </button>
      </div>
    </header>
  );
}
