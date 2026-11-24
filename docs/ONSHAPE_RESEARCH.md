# Onshape research notes — VÉRTEX CAD

## Scope and evidence

These notes preserve the static-analysis inventory recorded during inspection of the user-provided Onshape Android package. The APK inventory contained 9 DEX files, native libraries, and graphical resources. The findings below are based on class/type names found in compiled DEX data.

**Evidence limitation:** a class name is evidence that a symbol/reference exists in the inspected package. It does not, by itself, establish the exact gesture sequence, data schema, solver equations, parameter semantics, or runtime behavior. Those details must be verified separately before implementation decisions are treated as confirmed.

## Sketch tools identified

- Line: `BTLineTool`
- Corner rectangle and center rectangle: `BTRectangleTool`, `BTCenterRectangleTool`
- Center circle and perimeter circle: `BTCircleTool`, `BTPerimeterCircleTool`
- Regular, inscribed, and circumscribed polygons: `BTPolygonTool`, `BTInscribedPolygonTool`, `BTCircumscribedPolygonTool`
- Ellipse: `BTEllipseTool`
- Arc, center-point arc, tangent arc: `BTArcTool`, `BTCenterpointArcTool`, `BTTangentArcTool`
- Bézier, spline, spline point: `BTBezierTool`, `BTSplineTool`, `BTSplinePointTool`
- Point and slot: `BTPointTool`, `BTSlotTool`
- Text and dimension: `BTTextTool`, `BTDimensionTool`
- Trim, extend, split, offset: `BTTrimTool`, `BTExtendTool`, `BTSplitEntityTool`, `BTOffsetTool`
- Sketch fillet and chamfer: `BTFilletTool`, `BTChamferTool`
- Linear/circular pattern, mirror, transform: `BTSketchLinearPatternTool`, `BTSketchCircularPatternTool`, `BTSketchMirrorTool`, `BTSketchTransformTool`
- Use and intersect geometry: `BTSketchUseTool`, `BTSketchIntersectTool`
- DXF/DWG and image import: `BTSketchImportDXFDWGTool`, `BTSketchImportImageTool`

## Constraint and inference symbols identified

The prior inspection identified these symbols in the inference/constraint area:

- `BTSketchConstraintNode`
- `GBTSketchConstraintNode`
- `BTSketchInference`
- `BTSketchAtomicInference`
- `BTSketchCompoundInference`
- `BTGLSketchConstraintType`

These names indicate areas to investigate (constraint representation, generated model types, inference composition, and constraint type enumeration). They do **not** disclose the complete constraint list or solver algorithm. VÉRTEX CAD will implement its own documented geometry model and solver.

## 3D and selection references

The inventory also recorded references associated with faces, edges, vertices, allowed selection, sketch entities, assembly patterns, geometric booleans, draft analysis, and sweep descriptions. Examples:

- `BTEntityFace`, `BTEntityEdge`
- `BTAllowedSelection`, `BTGLAllowedSelection`
- `BTGLSketchEntity`
- `BTAssemblyPattern`
- `BTBSGeometricBoolean`
- `BTDraftAnalysis`
- `BTSweepDescription`

The earlier pass did not establish class-level evidence for every common solid feature. Do not treat an operation as confirmed solely because it appears in a UI mock-up.

## Implementation priorities

1. Build a stable sketch entity model and coordinate system.
2. Add geometric constraints and a numerical solver with automated tests.
3. Add snapping/inference as a separate layer from hard constraints.
4. Add curve editing and profile validation (trim, extend, split, offset).
5. Add face/edge/vertex selection and a feature graph for 3D operations.
6. Add serialization, reload, undo/redo, and browser/device validation.

## Engineering rules

- Implement independently; do not copy Onshape source code, assets, or branding.
- Keep inference (temporary suggestions) separate from persistent constraints.
- A UI control remains disabled until its operation has implementation and tests.
- Preserve a single coordinate transform for pointer input, snapping, preview, and committed geometry.
- Each feature must update geometry, feature history, selection, persistence, and undo/redo consistently.
