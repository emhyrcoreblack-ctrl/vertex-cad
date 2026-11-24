import test from "node:test";
import assert from "node:assert/strict";
import { createSketchModel, addLine, addCircle, addConstraint, solveSketch } from "../src/kernel/sketch-kernel.js";

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

test("parallel constraint aligns two line directions", () => {
  const model = createSketchModel();
  const a = addLine(model, 0, 0, 10, 2);
  const b = addLine(model, 0, 8, 7, 10);
  addConstraint(model, "parallel", [a.id, b.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  const cross = (a.x2-a.x1)*(b.y2-b.y1) - (a.y2-a.y1)*(b.x2-b.x1);
  assert.ok(Math.abs(cross) / (Math.hypot(a.x2-a.x1,a.y2-a.y1)*Math.hypot(b.x2-b.x1,b.y2-b.y1)) < 1e-6);
});

test("perpendicular constraint makes two line directions orthogonal", () => {
  const model = createSketchModel();
  const a = addLine(model, 0, 0, 10, 2);
  const b = addLine(model, 0, 8, 7, 10);
  addConstraint(model, "perpendicular", [a.id, b.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  const dot = (a.x2-a.x1)*(b.x2-b.x1) + (a.y2-a.y1)*(b.y2-b.y1);
  assert.ok(Math.abs(dot) / (Math.hypot(a.x2-a.x1,a.y2-a.y1)*Math.hypot(b.x2-b.x1,b.y2-b.y1)) < 1e-6);
});

test("equal constraint makes two line lengths match", () => {
  const model = createSketchModel();
  const a = addLine(model, 0, 0, 10, 2);
  const b = addLine(model, 0, 8, 7, 10);
  addConstraint(model, "equal", [a.id, b.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.abs(Math.hypot(a.x2-a.x1,a.y2-a.y1)-Math.hypot(b.x2-b.x1,b.y2-b.y1)) < 1e-5);
});


test("radius constraint drives a circle to its exact parametric radius", () => {
  const model = createSketchModel();
  const circle = addCircle(model, 4, -2, 3);
  addConstraint(model, "radius", [circle.id], 12.5);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.abs(circle.r - 12.5) < 1e-6);
});

test("concentric constraint aligns two circle centres without forcing equal radii", () => {
  const model = createSketchModel();
  const a = addCircle(model, 0, 0, 4);
  const b = addCircle(model, 8, -3, 9);
  addConstraint(model, "concentric", [a.id, b.id]);
  const result = solveSketch(model);
  assert.equal(result.converged, true);
  assert.ok(Math.hypot(a.cx - b.cx, a.cy - b.cy) < 1e-6);
  assert.ok(Math.abs(a.r - 4) < 1e-9);
  assert.ok(Math.abs(b.r - 9) < 1e-9);
});

test("radius constraint rejects zero and negative dimensions", async () => {
  const { addCircle } = await import("../src/kernel/sketch-kernel.js");
  const model = createSketchModel();
  const circle = addCircle(model, 0, 0, 5);
  assert.throws(() => addConstraint(model, "radius", [circle.id], 0), /positive/);
  assert.throws(() => addConstraint(model, "radius", [circle.id], -2), /positive/);
});
