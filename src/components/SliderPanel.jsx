import { useStudioStore } from '../store';

export default function SliderPanel() {
  const sliders = useStudioStore((s) => s.sliders);
  const updateSlider = useStudioStore((s) => s.updateSlider);

  return (
    <section className="panel-card">
      <h3>Variable Sliders</h3>
      {Object.entries(sliders).length === 0 && <p className="hint">No variables detected yet.</p>}
      {Object.entries(sliders).map(([name, cfg]) => (
        <div key={name} className="slider-row">
          <div className="slider-meta">
            <strong>{name}</strong>
            <span>{cfg.value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            value={cfg.value}
            onChange={(e) => updateSlider(name, { value: Number(e.target.value) })}
          />
          <div className="slider-config">
            <input type="number" value={cfg.min} onChange={(e) => updateSlider(name, { min: Number(e.target.value) })} />
            <input type="number" value={cfg.max} onChange={(e) => updateSlider(name, { max: Number(e.target.value) })} />
            <input
              type="number"
              value={cfg.step}
              step="0.01"
              onChange={(e) => updateSlider(name, { step: Number(e.target.value) })}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
