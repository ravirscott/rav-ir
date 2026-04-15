import { useStudioStore } from '../store';

export default function EquationList() {
  const equations = useStudioStore((s) => s.equations);
  const addEquation = useStudioStore((s) => s.addEquation);
  const updateEquation = useStudioStore((s) => s.updateEquation);
  const toggleEquation = useStudioStore((s) => s.toggleEquation);
  const removeEquation = useStudioStore((s) => s.removeEquation);

  return (
    <section className="panel-card">
      <div className="section-head">
        <h3>Equations</h3>
        <button onClick={addEquation}>+ Add</button>
      </div>
      {equations.map((eq, idx) => (
        <div key={eq.id} className="equation-row">
          <span className="swatch" style={{ backgroundColor: eq.color }} />
          <input
            value={eq.expression}
            onChange={(e) => updateEquation(eq.id, e.target.value)}
            placeholder={`Equation ${idx + 1}`}
          />
          <button onClick={() => toggleEquation(eq.id)}>{eq.visible ? 'Hide' : 'Show'}</button>
          <button className="danger" onClick={() => removeEquation(eq.id)}>
            ✕
          </button>
        </div>
      ))}
      <p className="hint">Use formats: y=f(x), r=f(theta), x=f(t), y=f(t).</p>
    </section>
  );
}
