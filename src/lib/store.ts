import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  EquationItem,
  GeometryCircle,
  GeometryLine,
  GeometryPoint,
  GraphMode,
  SliderConfig,
  TablePoint
} from './types';
import { detectVariables, ensureSliders, palette } from './mathEngine';

interface StudioState {
  mode: GraphMode;
  equations: EquationItem[];
  sliders: SliderConfig[];
  tablePoints: TablePoint[];
  connectTable: boolean;
  geometryPoints: GeometryPoint[];
  geometryLines: GeometryLine[];
  geometryCircles: GeometryCircle[];
  surfaceExpr: string;
  setMode: (mode: GraphMode) => void;
  addEquation: () => void;
  updateEquation: (id: string, patch: Partial<EquationItem>) => void;
  removeEquation: (id: string) => void;
  updateSlider: (variable: string, patch: Partial<SliderConfig>) => void;
  upsertTablePoint: (id: string, patch: Partial<TablePoint>) => void;
  addTablePoint: () => void;
  removeTablePoint: (id: string) => void;
  setConnectTable: (connect: boolean) => void;
  setSurfaceExpr: (expr: string) => void;
  resetAll: () => void;
  saveLocal: () => void;
  loadLocal: () => void;
  addGeometryPoint: (x: number, y: number) => void;
  addGeometryLine: (from: string, to: string) => void;
  addGeometryCircle: (center: string, radius: number) => void;
  translateGeometry: (dx: number, dy: number) => void;
  scaleGeometry: (factor: number) => void;
  rotateGeometry: (deg: number) => void;
}

const defaultEquation = (): EquationItem => ({
  id: uuid(),
  expression: 'y = x^2',
  visible: true,
  color: palette[Math.floor(Math.random() * palette.length)],
  type: 'cartesian'
});

const initialState = {
  mode: '2d' as GraphMode,
  equations: [defaultEquation()],
  sliders: [] as SliderConfig[],
  tablePoints: [
    { id: uuid(), x: 1, y: 2 },
    { id: uuid(), x: 2, y: 4 }
  ],
  connectTable: true,
  geometryPoints: [] as GeometryPoint[],
  geometryLines: [] as GeometryLine[],
  geometryCircles: [] as GeometryCircle[],
  surfaceExpr: 'z = sin(x*y)'
};

const refreshSliders = (equations: EquationItem[], sliders: SliderConfig[]) =>
  ensureSliders(detectVariables(equations), sliders);

export const useStudioStore = create<StudioState>((set, get) => ({
  ...initialState,
  setMode: (mode) => set({ mode }),
  addEquation: () =>
    set((state) => {
      const equations = [...state.equations, { ...defaultEquation(), expression: '' }];
      return { equations, sliders: refreshSliders(equations, state.sliders) };
    }),
  updateEquation: (id, patch) =>
    set((state) => {
      const equations = state.equations.map((eq) => (eq.id === id ? { ...eq, ...patch } : eq));
      return { equations, sliders: refreshSliders(equations, state.sliders) };
    }),
  removeEquation: (id) =>
    set((state) => {
      const equations = state.equations.filter((eq) => eq.id !== id);
      return { equations, sliders: refreshSliders(equations, state.sliders) };
    }),
  updateSlider: (variable, patch) =>
    set((state) => ({
      sliders: state.sliders.map((s) => (s.variable === variable ? { ...s, ...patch } : s))
    })),
  upsertTablePoint: (id, patch) =>
    set((state) => ({
      tablePoints: state.tablePoints.map((p) => (p.id === id ? { ...p, ...patch } : p))
    })),
  addTablePoint: () =>
    set((state) => ({
      tablePoints: [...state.tablePoints, { id: uuid(), x: 0, y: 0 }]
    })),
  removeTablePoint: (id) => set((state) => ({ tablePoints: state.tablePoints.filter((p) => p.id !== id) })),
  setConnectTable: (connectTable) => set({ connectTable }),
  setSurfaceExpr: (surfaceExpr) => set({ surfaceExpr }),
  resetAll: () => set({ ...initialState, equations: [defaultEquation()] }),
  saveLocal: () => {
    const state = get();
    localStorage.setItem(
      'ravir_math_studio',
      JSON.stringify({
        equations: state.equations,
        sliders: state.sliders,
        tablePoints: state.tablePoints,
        connectTable: state.connectTable,
        surfaceExpr: state.surfaceExpr
      })
    );
  },
  loadLocal: () => {
    const raw = localStorage.getItem('ravir_math_studio');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<StudioState>;
      set((state) => ({
        equations: parsed.equations ?? state.equations,
        sliders: parsed.sliders ?? state.sliders,
        tablePoints: parsed.tablePoints ?? state.tablePoints,
        connectTable: parsed.connectTable ?? state.connectTable,
        surfaceExpr: parsed.surfaceExpr ?? state.surfaceExpr
      }));
    } catch {
      // no-op for corrupted payloads
    }
  },
  addGeometryPoint: (x, y) => set((state) => ({ geometryPoints: [...state.geometryPoints, { id: uuid(), x, y }] })),
  addGeometryLine: (from, to) => set((state) => ({ geometryLines: [...state.geometryLines, { id: uuid(), from, to }] })),
  addGeometryCircle: (center, radius) =>
    set((state) => ({ geometryCircles: [...state.geometryCircles, { id: uuid(), center, radius }] })),
  translateGeometry: (dx, dy) =>
    set((state) => ({
      geometryPoints: state.geometryPoints.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
    })),
  scaleGeometry: (factor) =>
    set((state) => ({
      geometryPoints: state.geometryPoints.map((p) => ({ ...p, x: p.x * factor, y: p.y * factor })),
      geometryCircles: state.geometryCircles.map((c) => ({ ...c, radius: c.radius * factor }))
    })),
  rotateGeometry: (deg) => {
    const radians = (deg * Math.PI) / 180;
    set((state) => ({
      geometryPoints: state.geometryPoints.map((p) => ({
        ...p,
        x: p.x * Math.cos(radians) - p.y * Math.sin(radians),
        y: p.x * Math.sin(radians) + p.y * Math.cos(radians)
      }))
    }));
  }
}));
