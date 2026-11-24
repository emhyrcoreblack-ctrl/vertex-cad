# VÉRTEX CAD

**VÉRTEX CAD** is an independent, browser-first parametric 3D CAD project. Its workflow and feature coverage are informed by static research into Onshape, but its implementation is original.

## Current test build — 0.4

- Three.js 3D viewport, orbit/pan/zoom camera controls and XY/XZ/YZ sketch planes.
- Line, corner rectangle, center rectangle, circle, semicircle arc, polygon and point tools.
- 0.5 mm grid snapping and automatic horizontal/vertical line direction.
- Initial 2D sketch kernel with horizontal, vertical, coincident, parallel, perpendicular, equal-length, distance and fixed-line constraints.
- Toolbar actions for horizontal, vertical and fixed-line constraints.
- Closed-profile extrusion with editable depth.
- Entity selection/deletion, initial undo/redo, JSON export and JSON open.
- GitHub Actions tests for the numerical kernel and browser-module JavaScript syntax.

## Run locally

Requires Node.js 20+ and an internet connection for Three.js CDN imports.

```bash
npm test
python -m http.server 8000
```

Open `http://localhost:8000` in a browser.

## Current limitations

This is an early test build, not a finished professional CAD system. The numerical solver is an initial damped least-squares implementation. Coincident, parallel, perpendicular, equal-length and distance constraints are available in the kernel but are not yet exposed as toolbar controls. Constraint conflict diagnosis, redundancy handling, arc/spline constraints, robust topology, trimming, extending, splitting, offset, revolve, sweep, loft, shell, boolean operations, full feature dependency recomputation, face/edge/vertex picking, and robust history are still pending. Browser/mobile interaction has not yet been manually validated.

## Development principles

- Implement CAD behavior independently; do not copy proprietary source code, assets, or branding.
- Keep the geometry kernel independent of the viewport.
- Separate transient inference from persistent constraints.
- Do not label features complete until automated and browser tests pass.
- Prioritize the web version and mobile-browser validation before Android packaging.
