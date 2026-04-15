import html2canvas from 'html2canvas';
import { useStudioStore } from '../lib/store';

export function TopBar() {
  const { saveLocal, loadLocal, resetAll } = useStudioStore();

  const exportPng = async () => {
    const root = document.getElementById('graph-capture');
    if (!root) return;
    const canvas = await html2canvas(root, { backgroundColor: '#0d1117' });
    const link = document.createElement('a');
    link.download = 'ravir-math-studio.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const share = async () => {
    const payload = btoa(JSON.stringify(localStorage.getItem('ravir_math_studio') ?? '{}'));
    const url = `${window.location.origin}${window.location.pathname}#share=${payload}`;
    await navigator.clipboard.writeText(url);
    window.alert('Shareable link copied to clipboard.');
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-panel/90 px-4 py-3 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-bold tracking-wide text-white">Ravir Math Studio</h1>
        <p className="text-xs text-muted">Realtime Graphing • Geometry • Math Art</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn" onClick={loadLocal}>
          Load
        </button>
        <button className="btn" onClick={saveLocal}>
          Save
        </button>
        <button className="btn" onClick={share}>
          Share
        </button>
        <button className="btn" onClick={exportPng}>
          Export PNG
        </button>
        <button className="btn-danger" onClick={resetAll}>
          Reset
        </button>
      </div>
    </header>
  );
}
