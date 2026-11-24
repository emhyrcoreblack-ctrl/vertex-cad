import test from "node:test";
import assert from "node:assert/strict";
import { createSketchModel, addLine, addConstraint, solveSketch } from "../src/kernel/sketch-kernel.js";

test("horizontal constraint aligns a line without changing its midpoint materially", () => {
  const model = createSketchModel();
  const line = addLine(model, 0, 0, 20, 4);
  addConstraint(model, "horizontal", [line.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.abs(line.y2 - line.y1) < 1e-6);
});

test("vertical constraint aligns a line", () => {
  const model = createSketchModel();
  const line = addLine(model, 2, 1, 7, 15);
  addConstraint(model, "vertical", [line.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.abs(line.x2 - line.x1) < 1e-6);
});

test("coincident constraint joins two endpoints", () => {
  const model = createSketchModel();
  const a = addLine(model, 0, 0, 10, 0);
  const b = addLine(model, 12, 3, 20, 8);
  addConstraint(model, "coincident", [
    { entityId: a.id, point: "end" },
    { entityId: b.id, point: "start" }
  ]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.hypot(a.x2 - b.x1, a.y2 - b.y1) < 1e-6);
});

test("distance constraint sets the length between endpoints", () => {
  const model = createSketchModel();
  const line = addLine(model, 0, 0, 8, 3);
  addConstraint(model, "distance", [
    { entityId: line.id, point: "start" },
    { entityId: line.id, point: "end" }
  ], 20);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.abs(Math.hypot(line.x2 - line.x1, line.y2 - line.y1) - 20) < 1e-5);
});

test("fixed constraint preserves the original line coordinates", () => {
  const model = createSketchModel();
  const line = addLine(model, 1, 2, 5, 7);
  addConstraint(model, "fixed", [line.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.deepEqual([line.x1, line.y1, line.x2, line.y2], [1, 2, 5, 7]);
});
