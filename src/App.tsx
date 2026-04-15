import { useEffect } from 'react';
import { GeometryWorkspace } from './components/GeometryWorkspace';
import { Graph2D } from './components/Graph2D';
import { Graph3D } from './components/Graph3D';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { useStudioStore } from './lib/store';

function applySharedStateFromHash(loadLocal: () => void) {
  const hash = window.location.hash.replace('#', '');
  if (!hash.startsWith('share=')) return;
  try {
    const payload = atob(hash.split('share=')[1]);
    localStorage.setItem('ravir_math_studio', JSON.parse(payload) as string);
    loadLocal();
  } catch {
    // ignore malformed payload
  }
}

export default function App() {
  const { mode, loadLocal } = useStudioStore();

  useEffect(() => {
    loadLocal();
    applySharedStateFromHash(loadLocal);
  }, [loadLocal]);

  return (
    <div className="h-screen bg-base text-slate-100">
      <TopBar />
      <main className="grid h-[calc(100vh-72px)] grid-cols-1 md:grid-cols-[360px_1fr]">
        <Sidebar />
        <section id="graph-capture" className="h-full w-full overflow-hidden">
          {mode === '2d' && <Graph2D />}
          {mode === '3d' && <Graph3D />}
          {mode === 'geometry' && <GeometryWorkspace />}
        </section>
      </main>
    </div>
  );
}
