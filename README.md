# VÉRTEX CAD

**VÉRTEX CAD** is an independent, browser-first 3D CAD project. The first milestone is a usable web prototype; packaging for Android (APK) comes only after the web experience is implemented and validated.

## Current prototype

- Three.js viewport with orbit controls, grid, axes, and origin.
- Sketch planes: XY, XZ, and YZ.
- Initial sketch tools: line, rectangle, center rectangle, circle, semicircular arc, polygon, and point.
- Basic horizontal/vertical inference for lines.
- Closed-profile extrusion with editable depth in millimeters.
- Basic selection, delete, JSON project export, and initial undo/redo.

## Known limitations

This is an early prototype, not yet a production CAD system. A constraint solver, robust trimming/extending, fully parametric feature editing, reliable solid selection, persistent project loading, and comprehensive undo/redo still need implementation and testing.

## Run

Open `index.html` through a local static web server. The page loads Three.js modules from jsDelivr, so an internet connection is required.

For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Development principles

- Implement CAD behavior independently; do not copy proprietary source code, assets, or branding from other CAD products.
- Verify changes in a real browser before calling a feature complete.
- Prioritize the web prototype and mobile-browser usability before Android packaging.

## Project status

Early foundation / prototype. Not production-ready.
