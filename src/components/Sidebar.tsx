import type { ChangeEvent } from 'react';
import { useStudioStore } from '../lib/store';

const typeOptions = [
  { label: 'Cartesian', value: 'cartesian' },
  { label: 'Polar', value: 'polar' },
  { label: 'Parametric', value: 'parametric' }
] as const;

export function Sidebar() {
  const {
    equations,
    sliders,
    updateSlider,
    addEquation,
    updateEquation,
    removeEquation,
    tablePoints,
    upsertTablePoint,
    addTablePoint,
    removeTablePoint,
    connectTable,
    setConnectTable,
    mode,
    setMode,
    surfaceExpr,
    setSurfaceExpr,
    geometryPoints,
    addGeometryLine,
    addGeometryCircle,
    translateGeometry,
    rotateGeometry,
    scaleGeometry
  } = useStudioStore();

  const onNumberInput = (event: ChangeEvent<HTMLInputElement>, cb: (value: number) => void) => {
    const value = Number(event.target.value);
    cb(Number.isFinite(value) ? value : 0);
  };

  return (
    <aside className="h-full overflow-y-auto border-r border-border bg-panel/80 p-3">
      <section className="mb-4">
        <h2 className="panel-title">Workspace</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(['2d', '3d', 'geometry'] as const).map((workspaceMode) => (
            <button
              key={workspaceMode}
              onClick={() => setMode(workspaceMode)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                mode === workspaceMode
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-border bg-base text-muted hover:text-white'
              }`}
            >
              {workspaceMode.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {(mode === '2d' || mode === '3d') && (
        <section className="mb-4 rounded-lg border border-border bg-base/80 p-3">
          <h2 className="panel-title">Equation List</h2>
          <div className="mt-2 space-y-2">
            {equations.map((eq) => (
              <div className="rounded-md border border-border bg-panel/70 p-2" key={eq.id}>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={eq.color}
                    className="h-8 w-8 rounded border border-border bg-transparent"
                    onChange={(e) => updateEquation(eq.id, { color: e.target.value })}
                  />
                  <input
                    value={eq.expression}
                    onChange={(e) => updateEquation(eq.id, { expression: e.target.value })}
                    placeholder={mode === '3d' ? 'z = sin(x*y)' : 'y = a*x^2 + b'}
                    className="input"
                  />
                  <button className="text-xs text-rose-400" onClick={() => removeEquation(eq.id)}>
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="input"
                    value={eq.type}
                    onChange={(e) => updateEquation(eq.id, { type: e.target.value as 'cartesian' | 'polar' | 'parametric' })}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {eq.type === 'parametric' && (
                    <>
                      <input
                        className="input"
                        value={eq.paramX ?? 'cos(t)'}
                        onChange={(e) => updateEquation(eq.id, { paramX: e.target.value })}
                        placeholder="x(t)"
                      />
                      <input
                        className="input"
                        value={eq.paramY ?? 'sin(t)'}
                        onChange={(e) => updateEquation(eq.id, { paramY: e.target.value })}
                        placeholder="y(t)"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
            <button className="btn w-full" onClick={addEquation}>
              + Add Equation
            </button>
          </div>
        </section>
      )}

      {mode === '3d' && (
        <section className="mb-4 rounded-lg border border-border bg-base/80 p-3">
          <h2 className="panel-title">3D Surface Expression</h2>
          <input className="input mt-2" value={surfaceExpr} onChange={(e) => setSurfaceExpr(e.target.value)} />
        </section>
      )}

      {mode === '2d' && (
        <>
          <section className="mb-4 rounded-lg border border-border bg-base/80 p-3">
            <h2 className="panel-title">Dynamic Sliders</h2>
            {sliders.length === 0 && <p className="mt-2 text-xs text-muted">No variables detected yet.</p>}
            <div className="mt-2 space-y-3">
              {sliders.map((slider) => (
                <div key={slider.variable} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{slider.variable}</span>
                    <span className="text-muted">{slider.value.toFixed(2)}</span>
                  </div>
                  <input
                    className="w-full"
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => updateSlider(slider.variable, { value: Number(e.target.value) })}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input className="input" value={slider.min} onChange={(e) => onNumberInput(e, (value) => updateSlider(slider.variable, { min: value }))} />
                    <input className="input" value={slider.max} onChange={(e) => onNumberInput(e, (value) => updateSlider(slider.variable, { max: value }))} />
                    <input className="input" value={slider.step} onChange={(e) => onNumberInput(e, (value) => updateSlider(slider.variable, { step: value || 0.1 }))} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-base/80 p-3">
            <h2 className="panel-title">Table Points</h2>
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={connectTable} onChange={(e) => setConnectTable(e.target.checked)} />
              Connect points
            </label>
            <div className="mt-2 space-y-2">
              {tablePoints.map((point) => (
                <div key={point.id} className="flex gap-2">
                  <input className="input" value={point.x} onChange={(e) => onNumberInput(e, (value) => upsertTablePoint(point.id, { x: value }))} />
                  <input className="input" value={point.y} onChange={(e) => onNumberInput(e, (value) => upsertTablePoint(point.id, { y: value }))} />
                  <button className="text-xs text-rose-400" onClick={() => removeTablePoint(point.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button className="btn mt-2 w-full" onClick={addTablePoint}>
              + Add Row
            </button>
          </section>
        </>
      )}

      {mode === 'geometry' && (
        <section className="rounded-lg border border-border bg-base/80 p-3">
          <h2 className="panel-title">Geometry Controls</h2>
          <p className="mt-2 text-xs text-muted">Tap/click on workspace to place points.</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button className="btn" onClick={() => translateGeometry(1, 1)}>
              Move +
            </button>
            <button className="btn" onClick={() => scaleGeometry(1.1)}>
              Scale +
            </button>
            <button className="btn" onClick={() => rotateGeometry(15)}>
              Rotate
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              className="btn"
              onClick={() => {
                if (geometryPoints.length >= 2) addGeometryLine(geometryPoints.at(-2)!.id, geometryPoints.at(-1)!.id);
              }}
            >
              Connect Last 2
            </button>
            <button
              className="btn"
              onClick={() => {
                if (geometryPoints.length > 0) addGeometryCircle(geometryPoints.at(-1)!.id, 3);
              }}
            >
              Circle @ Last
            </button>
          </div>
        </section>
      )}
    </aside>
  );
}
