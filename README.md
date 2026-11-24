# VÉRTEX CAD

**VÉRTEX CAD** is an independent, browser-first parametric 3D CAD project. Its workflow and feature coverage are informed by static research into Onshape, but its implementation is original.

## Current repository foundation

- Three.js browser prototype in `index.html`.
- Initial sketch tools and closed-profile extrusion.
- Onshape static-analysis inventory and evidence limitations in `docs/ONSHAPE_RESEARCH.md`.
- Layered engineering plan in `docs/ARCHITECTURE.md`.
- Independent 2D sketch kernel in `src/kernel/sketch-kernel.js`.
- Automated kernel tests in `tests/sketch-kernel.test.mjs`.

## Run the current prototype

Serve the repository root with a static web server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. The current UI imports Three.js from jsDelivr, so an internet connection is required.

## Run kernel tests

Requires Node.js 20 or newer:

```bash
npm test
```

## Development principles

- Implement CAD behavior independently; do not copy proprietary source code, assets, or branding from other products.
- Keep the geometry kernel independent of the viewport.
- Separate transient inference from persistent constraints.
- Do not label features complete until automated and browser tests pass.
- Prioritize the web version and mobile-browser validation before Android packaging.

## Status

Early engineering foundation. The sketch kernel is an initial constraint-solving slice, not yet a production-grade CAD solver or finished professional CAD application.
