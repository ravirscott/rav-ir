import { useState } from 'react';

export default function GeometryBoard() {
  const [points, setPoints] = useState([]);
  const [tool, setTool] = useState('point');
  const [transform, setTransform] = useState({ dx: 0, dy: 0, scale: 1, rotate: 0 });

  const addPoint = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prev) => [...prev, { x, y }]);
  };

  const transformed = points.map((p) => {
    const cx = p.x - 350;
    const cy = p.y - 250;
    const r = (transform.rotate * Math.PI) / 180;
    const sx = cx * transform.scale;
    const sy = cy * transform.scale;
    return {
      x: sx * Math.cos(r) - sy * Math.sin(r) + 350 + transform.dx,
      y: sx * Math.sin(r) + sy * Math.cos(r) + 250 + transform.dy,
    };
  });

  return (
    <div className="geometry-wrap">
      <div className="geometry-toolbar">
        <button className={tool === 'point' ? 'active' : ''} onClick={() => setTool('point')}>Point</button>
        <button className={tool === 'polygon' ? 'active' : ''} onClick={() => setTool('polygon')}>Polygon</button>
        <label>dx <input type="number" value={transform.dx} onChange={(e) => setTransform((s) => ({ ...s, dx: Number(e.target.value) }))} /></label>
        <label>dy <input type="number" value={transform.dy} onChange={(e) => setTransform((s) => ({ ...s, dy: Number(e.target.value) }))} /></label>
        <label>scale <input type="number" step="0.1" value={transform.scale} onChange={(e) => setTransform((s) => ({ ...s, scale: Number(e.target.value) }))} /></label>
        <label>rotate° <input type="number" value={transform.rotate} onChange={(e) => setTransform((s) => ({ ...s, rotate: Number(e.target.value) }))} /></label>
      </div>
      <svg className="geometry-board" viewBox="0 0 700 500" onClick={addPoint}>
        <rect width="700" height="500" fill="#0d1117" />
        <line x1="0" y1="250" x2="700" y2="250" stroke="#30363d" />
        <line x1="350" y1="0" x2="350" y2="500" stroke="#30363d" />
        {tool === 'polygon' && transformed.length > 2 && <polygon points={transformed.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(88,166,255,0.25)" stroke="#58a6ff" />}
        {transformed.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#3fb950" />
            <text x={p.x + 6} y={p.y - 6} fill="#8b949e" fontSize="10">P{i + 1}</text>
          </g>
        ))}
      </svg>
      <p className="hint">Click to create points. Geometry tools include polygon drawing and transform controls.</p>
    </div>
  );
}
