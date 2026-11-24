# VÉRTEX CAD

**VÉRTEX CAD** is an independent, browser-first parametric 3D CAD project. Its workflow and feature coverage are informed by static research into Onshape, but its implementation is original.

## Current test build — 0.9

- Three.js 3D viewport, orbit/pan/zoom camera controls, interactive standard views (isometric, top, front, right) and XY/XZ/YZ sketch planes.
- Rebuilt document workspace with Part Studio tab, document actions, feature-operation toolbar, searchable feature tree, properties panel and responsive mobile layout. Only extrusion is active in the feature toolbar; unfinished operations are visibly disabled.
- Line, corner rectangle, center rectangle, circle, ellipse, semicircle arc, polygon and point tools. Ellipse is defined by opposite bounding-box corners and can be extruded as a closed profile.
- 0.5 mm grid snapping and automatic horizontal/vertical line direction.
- Initial 2D sketch kernel with horizontal, vertical, coincident, parallel, perpendicular, equal-length, distance and fixed-line constraints.
- Toolbar actions for horizontal, vertical and fixed-line constraints.
- UI controls for coincident endpoints, parallel lines, perpendicular lines, equal line lengths and numeric line distance. Two-line constraints use explicit A/B selectors; endpoint coincidence lets you choose each endpoint.
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

This is an early test build, not a finished professional CAD system and not an identical Onshape reproduction. The 0.9 update restructures the document shell and feature workflow; it does not yet implement the disabled feature operations. The numerical solver is an initial damped least-squares implementation. The solver remains an initial damped least-squares implementation; conflict diagnosis and redundancy handling are not yet available. Constraint tools are now exposed in the UI, but still require manual browser/mobile validation. Constraint conflict diagnosis, redundancy handling, arc/spline constraints, robust topology, trimming, extending, splitting, offset, revolve, sweep, loft, shell, boolean operations, full feature dependency recomputation, face/edge/vertex picking, and robust history are still pending. Browser/mobile interaction has not yet been manually validated.

## Development principles

- Implement CAD behavior independently; do not copy proprietary source code, assets, or branding.
- Keep the geometry kernel independent of the viewport.
- Separate transient inference from persistent constraints.
- Do not label features complete until automated and browser tests pass.
- Prioritize the web version and mobile-browser validation before Android packaging.
