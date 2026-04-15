import { compile } from 'mathjs';
import type { EquationItem, SliderConfig } from './types';

const RESERVED = new Set([
  'x',
  'y',
  'z',
  't',
  'theta',
  'pi',
  'e',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'log',
  'ln',
  'sqrt',
  'abs',
  'exp',
  'min',
  'max',
  'pow',
  'floor',
  'ceil',
  'round',
  'mod',
  'if'
]);

export const palette = ['#58a6ff', '#f778ba', '#3fb950', '#d29922', '#a371f7', '#ff7b72'];

export function normalizeExpression(expression: string): string {
  return expression.replace(/\^/g, '**').trim();
}

export function detectVariables(equations: EquationItem[]): string[] {
  const vars = new Set<string>();
  for (const eq of equations) {
    const source = [eq.expression, eq.paramX ?? '', eq.paramY ?? ''].join(' ');
    const matches = source.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];
    for (const token of matches) {
      const lower = token.toLowerCase();
      if (!RESERVED.has(lower)) {
        vars.add(token);
      }
    }
  }
  return [...vars].sort();
}

export function ensureSliders(vars: string[], existing: SliderConfig[]): SliderConfig[] {
  const map = new Map(existing.map((slider) => [slider.variable, slider]));
  return vars.map((variable) =>
    map.get(variable) ?? {
      variable,
      value: 1,
      min: -10,
      max: 10,
      step: 0.1
    }
  );
}

function safeEval(compiled: ReturnType<typeof compile>, scope: Record<string, number>): number {
  const result = compiled.evaluate(scope);
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    return Number.NaN;
  }
  return result;
}

export function build2DTrace(
  eq: EquationItem,
  sliderScope: Record<string, number>,
  xDomain: [number, number]
): { x: number[]; y: number[]; mode: 'lines'; type: 'scatter'; line: { color: string; width: number }; name: string } | null {
  const samples = 420;

  try {
    if (eq.type === 'parametric') {
      const xCompiled = compile(normalizeExpression(eq.paramX ?? 'cos(t)'));
      const yCompiled = compile(normalizeExpression(eq.paramY ?? 'sin(t)'));
      const x: number[] = [];
      const y: number[] = [];
      for (let i = 0; i < samples; i += 1) {
        const t = (i / (samples - 1)) * Math.PI * 2;
        const scope = { ...sliderScope, t };
        x.push(safeEval(xCompiled, scope));
        y.push(safeEval(yCompiled, scope));
      }
      return { x, y, mode: 'lines', type: 'scatter', line: { color: eq.color, width: 2 }, name: eq.expression || 'parametric' };
    }

    if (eq.type === 'polar') {
      const rCompiled = compile(normalizeExpression(eq.expression.replace(/^r\s*=\s*/i, '')));
      const x: number[] = [];
      const y: number[] = [];
      for (let i = 0; i < samples; i += 1) {
        const theta = (i / (samples - 1)) * Math.PI * 2;
        const scope = { ...sliderScope, theta };
        const r = safeEval(rCompiled, scope);
        x.push(r * Math.cos(theta));
        y.push(r * Math.sin(theta));
      }
      return { x, y, mode: 'lines', type: 'scatter', line: { color: eq.color, width: 2 }, name: eq.expression || 'polar' };
    }

    const rawExpr = eq.expression.replace(/^y\s*=\s*/i, '');
    const compiled = compile(normalizeExpression(rawExpr));
    const x: number[] = [];
    const y: number[] = [];
    const [minX, maxX] = xDomain;

    for (let i = 0; i < samples; i += 1) {
      const xv = minX + ((maxX - minX) * i) / (samples - 1);
      const val = safeEval(compiled, { ...sliderScope, x: xv });
      x.push(xv);
      y.push(val);
    }

    return {
      x,
      y,
      mode: 'lines',
      type: 'scatter',
      line: { color: eq.color, width: 2 },
      name: eq.expression || 'equation'
    };
  } catch {
    return null;
  }
}

export function buildSurface(expr: string, sliders: Record<string, number>) {
  const sanitized = normalizeExpression(expr.replace(/^z\s*=\s*/i, ''));
  const compiled = compile(sanitized);
  const axis = Array.from({ length: 45 }, (_, i) => -8 + (16 * i) / 44);
  const z = axis.map((x) => axis.map((y) => safeEval(compiled, { ...sliders, x, y })));
  return { x: axis, y: axis, z };
}
