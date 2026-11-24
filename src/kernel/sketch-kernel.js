/**
 * VÉRTEX CAD — independent 2D sketch kernel.
 * Units: millimetres. Coordinates: sketch-local XY.
 * This module contains no UI or Three.js dependencies.
 */

const EPS = 1e-9;

export function createSketchModel(name = "Sketch") {
  return { id: makeId("sketch"), name, entities: [], constraints: [], revision: 0 };
}

export function addLine(model, x1, y1, x2, y2, options = {}) {
  assertFinite([x1, y1, x2, y2]);
  const entity = {
    id: options.id ?? makeId("line"),
    type: "line", x1, y1, x2, y2,
    construction: Boolean(options.construction)
  };
  model.entities.push(entity);
  model.revision++;
  return entity;
}

export function addCircle(model, cx, cy, radius, options = {}) {
  assertFinite([cx, cy, radius]);
  if (radius <= 0) throw new RangeError("Circle radius must be greater than zero.");
  const entity = {
    id: options.id ?? makeId("circle"),
    type: "circle", cx, cy, r: radius,
    construction: Boolean(options.construction)
  };
  model.entities.push(entity);
  model.revision++;
  return entity;
}

/**
 * Supported constraints:
 * horizontal(line), vertical(line), coincident(lineA.end,lineB.start),
 * parallel(lineA,lineB), perpendicular(lineA,lineB), equal(lineA,lineB),
 * distance(lineA.start,lineA.end,value), fixed(line).
 */
export function addConstraint(model, type, refs, value = null, options = {}) {
  const allowed = new Set([
    "horizontal", "vertical", "coincident", "parallel",
    "perpendicular", "equal", "distance", "fixed"
  ]);
  if (!allowed.has(type)) throw new TypeError(`Unsupported constraint: ${type}`);
  const constraint = {
    id: options.id ?? makeId("constraint"),
    type,
    refs: structuredCloneSafe(refs),
    value: value == null ? null : Number(value),
    weight: Number.isFinite(options.weight) ? options.weight : 1,
    target: null
  };
  validateConstraintRefs(model, constraint);
  if (type === "fixed") {
    const line = getLine(model, refs[0]);
    constraint.target = { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 };
  }
  if (type === "distance" && (!Number.isFinite(constraint.value) || constraint.value < 0)) {
    throw new RangeError("Distance constraint requires a non-negative value.");
  }
  model.constraints.push(constraint);
  model.revision++;
  return constraint;
}

export function solveSketch(model, options = {}) {
  const maxIterations = options.maxIterations ?? 80;
  const tolerance = options.tolerance ?? 1e-7;
  const dampingStart = options.damping ?? 1e-3;
  const variables = collectVariables(model);
  if (!variables.length || !model.constraints.length) {
    return { converged: model.constraints.length === 0, iterations: 0, maxResidual: 0, dof: variables.length, model };
  }

  let x = variables.map(v => v.get());
  let lambda = dampingStart;
  let residual = residualVector(model, variables, x);
  let cost = squaredNorm(residual);
  let iterations = 0;

  for (; iterations < maxIterations; iterations++) {
    const maxResidual = maxAbs(residual);
    if (maxResidual <= tolerance) break;

    const J = numericalJacobian(model, variables, x, residual);
    const JTJ = zeros(x.length, x.length);
    const JTr = new Array(x.length).fill(0);

    for (let r = 0; r < residual.length; r++) {
      for (let i = 0; i < x.length; i++) {
        JTr[i] += J[r][i] * residual[r];
        for (let j = 0; j < x.length; j++) JTJ[i][j] += J[r][i] * J[r][j];
      }
    }

    let accepted = false;
    for (let attempt = 0; attempt < 8; attempt++) {
      const A = JTJ.map((row, i) => row.map((v, j) => v + (i === j ? lambda : 0)));
      const delta = solveLinearSystem(A, JTr.map(v => -v));
      if (!delta) { lambda *= 10; continue; }
      const candidate = x.map((v, i) => v + delta[i]);
      const nextResidual = residualVector(model, variables, candidate);
      const nextCost = squaredNorm(nextResidual);
      if (Number.isFinite(nextCost) && nextCost < cost) {
        x = candidate;
        residual = nextResidual;
        cost = nextCost;
        lambda = Math.max(lambda / 3, 1e-12);
        accepted = true;
        break;
      }
      lambda *= 10;
    }
    if (!accepted) break;
  }

  variables.forEach((v, i) => v.set(x[i]));
  model.revision++;
  const maxResidual = maxAbs(residual);
  return {
    converged: maxResidual <= tolerance,
    iterations,
    maxResidual,
    residualNorm: Math.sqrt(cost),
    dof: estimateDof(model, variables, x),
    model
  };
}

export function serializeSketch(model) {
  return JSON.parse(JSON.stringify(model));
}

function collectVariables(model) {
  const vars = [];
  for (const e of model.entities) {
    if (e.type === "line") {
      for (const key of ["x1", "y1", "x2", "y2"]) vars.push({ get: () => e[key], set: v => { e[key] = v; } });
    } else if (e.type === "circle") {
      for (const key of ["cx", "cy", "r"]) vars.push({ get: () => e[key], set: v => { e[key] = v; } });
    }
  }
  return vars;
}

function residualVector(model, variables, values) {
  variables.forEach((v, i) => v.set(values[i]));
  const out = [];
  for (const c of model.constraints) {
    const w = Math.sqrt(c.weight);
    const push = value => out.push(value * w);
    if (c.type === "horizontal" || c.type === "vertical") {
      const l = getLine(model, c.refs[0]);
      push(c.type === "horizontal" ? l.y2 - l.y1 : l.x2 - l.x1);
    } else if (c.type === "coincident") {
      const a = pointOnLine(model, c.refs[0]);
      const b = pointOnLine(model, c.refs[1]);
      push(a.x - b.x); push(a.y - b.y);
    } else if (c.type === "parallel" || c.type === "perpendicular") {
      const a = getLine(model, c.refs[0]), b = getLine(model, c.refs[1]);
      const ax = a.x2 - a.x1, ay = a.y2 - a.y1;
      const bx = b.x2 - b.x1, by = b.y2 - b.y1;
      const al = Math.hypot(ax, ay), bl = Math.hypot(bx, by);
      if (al < EPS || bl < EPS) { push(1e3); continue; }
      push(c.type === "parallel" ? (ax * by - ay * bx) / (al * bl) : (ax * bx + ay * by) / (al * bl));
    } else if (c.type === "equal") {
      const a = getLine(model, c.refs[0]), b = getLine(model, c.refs[1]);
      push(length(a) - length(b));
    } else if (c.type === "distance") {
      const a = pointOnLine(model, c.refs[0]), b = pointOnLine(model, c.refs[1]);
      push(Math.hypot(a.x - b.x, a.y - b.y) - c.value);
    } else if (c.type === "fixed") {
      const l = getLine(model, c.refs[0]);
      push(l.x1 - c.target.x1); push(l.y1 - c.target.y1);
      push(l.x2 - c.target.x2); push(l.y2 - c.target.y2);
    }
  }
  return out;
}

function numericalJacobian(model, variables, x, baseResidual) {
  const J = zeros(baseResidual.length, x.length);
  for (let col = 0; col < x.length; col++) {
    const h = 1e-6 * Math.max(1, Math.abs(x[col]));
    const shifted = x.slice();
    shifted[col] += h;
    const r = residualVector(model, variables, shifted);
    for (let row = 0; row < r.length; row++) J[row][col] = (r[row] - baseResidual[row]) / h;
  }
  residualVector(model, variables, x);
  return J;
}

function estimateDof(model, variables, x) {
  if (!model.constraints.length) return variables.length;
  const r = residualVector(model, variables, x);
  const J = numericalJacobian(model, variables, x, r);
  // Rank estimate via pivoted elimination on JᵀJ.
  const gram = zeros(x.length, x.length);
  for (const row of J) for (let i = 0; i < x.length; i++) for (let j = 0; j < x.length; j++) gram[i][j] += row[i] * row[j];
  return Math.max(0, variables.length - matrixRank(gram, 1e-8));
}

function matrixRank(matrix, eps) {
  if (!matrix.length) return 0;
  const a = matrix.map(row => row.slice());
  let rank = 0, col = 0;
  while (rank < a.length && col < a[0].length) {
    let pivot = rank;
    for (let r = rank + 1; r < a.length; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) <= eps) { col++; continue; }
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const p = a[rank][col];
    for (let c = col; c < a[rank].length; c++) a[rank][c] /= p;
    for (let r = 0; r < a.length; r++) if (r !== rank) {
      const f = a[r][col];
      for (let c = col; c < a[r].length; c++) a[r][c] -= f * a[rank][c];
    }
    rank++; col++;
  }
  return rank;
}

function solveLinearSystem(A, b) {
  const n = b.length, m = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    if (Math.abs(m[pivot][col]) < 1e-14) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const p = m[col][col];
    for (let j = col; j <= n; j++) m[col][j] /= p;
    for (let r = 0; r < n; r++) if (r !== col) {
      const f = m[r][col];
      for (let j = col; j <= n; j++) m[r][j] -= f * m[col][j];
    }
  }
  return m.map(row => row[n]);
}

function validateConstraintRefs(model, c) {
  const expected = c.type === "coincident" || c.type === "distance" ? 2 : c.type === "parallel" || c.type === "perpendicular" || c.type === "equal" ? 2 : 1;
  if (!Array.isArray(c.refs) || c.refs.length !== expected) throw new TypeError(`${c.type} expects ${expected} reference(s).`);
  if (["horizontal", "vertical", "fixed"].includes(c.type)) getLine(model, c.refs[0]);
  if (["parallel", "perpendicular", "equal"].includes(c.type)) c.refs.forEach(id => getLine(model, id));
  if (["coincident", "distance"].includes(c.type)) c.refs.forEach(ref => pointOnLine(model, ref));
}

function getLine(model, id) {
  const e = model.entities.find(item => item.id === (typeof id === "string" ? id : id.entityId));
  if (!e || e.type !== "line") throw new TypeError(`Line not found: ${typeof id === "string" ? id : id.entityId}`);
  return e;
}
function pointOnLine(model, ref) {
  if (!ref || typeof ref !== "object" || !["start", "end"].includes(ref.point)) throw new TypeError("Point reference must be { entityId, point: 'start'|'end' }.");
  const l = getLine(model, ref.entityId);
  return ref.point === "start" ? { x: l.x1, y: l.y1 } : { x: l.x2, y: l.y2 };
}
function length(l) { return Math.hypot(l.x2 - l.x1, l.y2 - l.y1); }
function zeros(rows, cols) { return Array.from({ length: rows }, () => new Array(cols).fill(0)); }
function squaredNorm(v) { return v.reduce((s, n) => s + n * n, 0); }
function maxAbs(v) { return v.reduce((m, n) => Math.max(m, Math.abs(n)), 0); }
function assertFinite(values) { if (values.some(v => !Number.isFinite(v))) throw new TypeError("Geometry values must be finite numbers."); }
function makeId(prefix) { return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`; }
function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
