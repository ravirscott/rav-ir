import { compile, parse } from 'mathjs';

const RESERVED = new Set(['x', 'y', 'z', 't', 'theta', 'pi', 'e']);

export function normalizeExpression(raw = '') {
  return raw
    .trim()
    .replace(/^\s*[yzr]\s*=\s*/i, '')
    .replace(/\bln\(/gi, 'log(')
    .replace(/\|([^|]+)\|/g, 'abs($1)');
}

export function detectVariables(expression) {
  try {
    const node = parse(normalizeExpression(expression));
    const variables = new Set();
    node.traverse((n) => {
      if (n.isSymbolNode) {
        const v = n.name;
        if (!RESERVED.has(v.toLowerCase())) {
          variables.add(v);
        }
      }
    });
    return [...variables];
  } catch {
    return [];
  }
}

export function compileExpression(expression) {
  return compile(normalizeExpression(expression));
}

export function evaluatePiecewise(expression, scope) {
  if (!expression.includes('{')) return compileExpression(expression).evaluate(scope);

  const parts = expression
    .replace(/[{}]/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [expr, condition] = part.split(':').map((s) => s.trim());
    if (!condition) continue;
    try {
      if (compile(condition).evaluate(scope)) {
        return compileExpression(expr).evaluate(scope);
      }
    } catch {
      continue;
    }
  }

  return null;
}
