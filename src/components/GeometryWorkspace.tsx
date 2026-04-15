import { useMemo } from 'react';
import { useStudioStore } from '../lib/store';

const toScreen = (x: number, y: number, width: number, height: number) => ({
  sx: width / 2 + x * 20,
  sy: height / 2 - y * 20
});

export function GeometryWorkspace() {
  const { geometryPoints, geometryLines, geometryCircles, addGeometryPoint } = useStudioStore();

  const pointsMap = useMemo(() => new Map(geometryPoints.map((p) => [p.id, p])), [geometryPoints]);

  return (
    <div className="relative h-full w-full bg-base">
      <svg
        className="h-full w-full"
        viewBox="0 0 1000 700"
        onClick={(e) => {
          const rect = (e.target as SVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * 1000;
          const py = ((e.clientY - rect.top) / rect.height) * 700;
          const x = (px - 500) / 20;
          const y = (350 - py) / 20;
          addGeometryPoint(Number(x.toFixed(2)), Number(y.toFixed(2)));
        }}
      >
        <rect width="1000" height="700" fill="#0d1117" />
        {Array.from({ length: 51 }, (_, i) => i * 20).map((v) => (
          <g key={`grid-${v}`}>
            <line x1={v} y1={0} x2={v} y2={700} stroke="#21262d" strokeWidth={1} />
            <line x1={0} y1={v} x2={1000} y2={v} stroke="#21262d" strokeWidth={1} />
          </g>
        ))}
        <line x1={500} y1={0} x2={500} y2={700} stroke="#8b949e" strokeWidth={1.5} />
        <line x1={0} y1={350} x2={1000} y2={350} stroke="#8b949e" strokeWidth={1.5} />

        {geometryLines.map((line) => {
          const from = pointsMap.get(line.from);
          const to = pointsMap.get(line.to);
          if (!from || !to) return null;
          const a = toScreen(from.x, from.y, 1000, 700);
          const b = toScreen(to.x, to.y, 1000, 700);
          return <line key={line.id} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="#58a6ff" strokeWidth={2.5} />;
        })}

        {geometryCircles.map((circle) => {
          const center = pointsMap.get(circle.center);
          if (!center) return null;
          const { sx, sy } = toScreen(center.x, center.y, 1000, 700);
          return <circle key={circle.id} cx={sx} cy={sy} r={Math.abs(circle.radius) * 20} stroke="#f778ba" fill="none" strokeWidth={2} />;
        })}

        {geometryPoints.map((point) => {
          const { sx, sy } = toScreen(point.x, point.y, 1000, 700);
          return (
            <g key={point.id}>
              <circle cx={sx} cy={sy} r={6} fill="#3fb950" />
              <text x={sx + 8} y={sy - 8} fill="#c9d1d9" fontSize={11}>{`(${point.x}, ${point.y})`}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
