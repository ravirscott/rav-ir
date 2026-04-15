import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { detectVariables } from './utils/mathEngine';

const palette = ['#58a6ff', '#d2a8ff', '#3fb950', '#f0883e', '#ff7b72', '#56d4dd', '#e3b341'];

const defaultEquation = () => ({
  id: uuid(),
  expression: 'y = sin(x)',
  type: 'cartesian',
  color: palette[0],
  visible: true,
  error: null,
});

const defaultTable = () => ({
  id: uuid(),
  points: [
    { x: 1, y: 2 },
    { x: 2, y: 4 },
  ],
  connect: true,
  color: '#f0883e',
  visible: true,
});

export const useStudioStore = create(
  persist(
    (set, get) => ({
      projectName: 'Ravir Math Studio Project',
      equations: [defaultEquation()],
      tables: [defaultTable()],
      sliders: { a: { value: 1, min: -10, max: 10, step: 0.1 } },
      mode: 'graph2d',
      graphView: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
      addEquation: () =>
        set((state) => ({
          equations: [
            ...state.equations,
            {
              id: uuid(),
              expression: 'y = x^2',
              type: 'cartesian',
              color: palette[state.equations.length % palette.length],
              visible: true,
              error: null,
            },
          ],
        })),
      updateEquation: (id, expression) =>
        set((state) => {
          const equations = state.equations.map((eq) => (eq.id === id ? { ...eq, expression } : eq));
          const variables = new Set(Object.keys(state.sliders));
          equations.forEach((eq) => detectVariables(eq.expression).forEach((v) => variables.add(v)));
          const sliders = [...variables].reduce((acc, key) => {
            acc[key] = state.sliders[key] || { value: 1, min: -10, max: 10, step: 0.1 };
            return acc;
          }, {});
          return { equations, sliders };
        }),
      toggleEquation: (id) =>
        set((state) => ({
          equations: state.equations.map((eq) => (eq.id === id ? { ...eq, visible: !eq.visible } : eq)),
        })),
      removeEquation: (id) => set((state) => ({ equations: state.equations.filter((eq) => eq.id !== id) })),
      updateSlider: (key, patch) => set((state) => ({ sliders: { ...state.sliders, [key]: { ...state.sliders[key], ...patch } } })),
      addTable: () => set((state) => ({ tables: [...state.tables, defaultTable()] })),
      updateTablePoint: (tableId, index, axis, value) =>
        set((state) => ({
          tables: state.tables.map((table) => {
            if (table.id !== tableId) return table;
            const points = [...table.points];
            points[index] = { ...points[index], [axis]: Number(value) };
            return { ...table, points };
          }),
        })),
      addTablePoint: (tableId) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId ? { ...table, points: [...table.points, { x: 0, y: 0 }] } : table
          ),
        })),
      toggleTableConnect: (tableId) =>
        set((state) => ({
          tables: state.tables.map((table) => (table.id === tableId ? { ...table, connect: !table.connect } : table)),
        })),
      setMode: (mode) => set({ mode }),
      setGraphView: (view) => set({ graphView: view }),
      resetProject: () =>
        set({
          projectName: 'Ravir Math Studio Project',
          equations: [defaultEquation()],
          tables: [defaultTable()],
          sliders: { a: { value: 1, min: -10, max: 10, step: 0.1 } },
          mode: 'graph2d',
          graphView: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        }),
      loadSharedState: (payload) => set(payload),
    }),
    { name: 'ravir-math-studio' }
  )
);
