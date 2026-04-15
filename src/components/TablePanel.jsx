import { useStudioStore } from '../store';

export default function TablePanel() {
  const tables = useStudioStore((s) => s.tables);
  const addTable = useStudioStore((s) => s.addTable);
  const addTablePoint = useStudioStore((s) => s.addTablePoint);
  const updateTablePoint = useStudioStore((s) => s.updateTablePoint);
  const toggleTableConnect = useStudioStore((s) => s.toggleTableConnect);

  return (
    <section className="panel-card">
      <div className="section-head">
        <h3>Tables</h3>
        <button onClick={addTable}>+ Table</button>
      </div>
      {tables.map((table, tIdx) => (
        <div key={table.id} className="table-card">
          <div className="section-head compact">
            <strong>Table {tIdx + 1}</strong>
            <button onClick={() => toggleTableConnect(table.id)}>{table.connect ? 'Connected' : 'Points Only'}</button>
          </div>
          <div className="table-grid">
            <span>x</span>
            <span>y</span>
            {table.points.map((p, idx) => (
              <div key={idx} className="point-row" style={{ display: 'contents' }}>
                <input type="number" value={p.x} onChange={(e) => updateTablePoint(table.id, idx, 'x', e.target.value)} />
                <input type="number" value={p.y} onChange={(e) => updateTablePoint(table.id, idx, 'y', e.target.value)} />
              </div>
            ))}
          </div>
          <button onClick={() => addTablePoint(table.id)}>+ Point</button>
        </div>
      ))}
    </section>
  );
}
