# VÉRTEX CAD — architecture and development plan

## Product target

A browser-first, mobile-capable parametric CAD application. The target workflow is comparable to established feature-based CAD systems, while all source code and geometry logic remain independently implemented.

## Layers

- `src/kernel/`: pure geometry and constraint solving; no DOM or rendering dependencies.
- `src/model/`: document, sketches, feature graph, stable IDs, dependency tracking.
- `src/operations/`: profile validation, extrusion, revolve, sweep, loft, shell, draft, patterns, booleans.
- `src/interaction/`: selection, snapping, inference, tool state machines, coordinate transforms.
- `src/viewport/`: Three.js rendering, camera, overlays, face/edge/vertex picking.
- `src/io/`: versioned project serialization, import/export.
- `tests/`: deterministic unit and integration tests.

## Core invariants

1. Geometry is stored in millimetres and sketch-local coordinates.
2. The kernel never reads DOM state or Three.js objects.
3. Inference hints are transient; constraints are persistent model data.
4. Features are nodes in a dependency graph and can be recomputed in order.
5. Every edit is undoable and serializable.
6. Rendering is a projection of the document model, never the source of truth.
7. No operation is exposed as complete until automated tests and browser checks pass.

## Milestones

- M0 — repository and architecture foundation.
- M1 — sketch entities, constraint model, numerical solver, tests.
- M2 — robust sketch tools and inference/snap engine.
- M3 — profile topology and edit operations.
- M4 — feature graph and first parametric solid features.
- M5 — solid topology selection and boolean operations.
- M6 — save/reload, history, mobile browser validation.
- M7 — Android packaging after web acceptance.

## Current implementation slice

The first kernel slice supports line and circle entities plus horizontal, vertical, coincident, parallel, perpendicular, equal-length, distance, and fixed-line constraints. It uses a damped least-squares numerical solver. This is an initial independent foundation, not a complete CAD solver: redundancy detection, conflict diagnosis, robust topology, arc/spline constraints, and deterministic branch handling remain future work.
