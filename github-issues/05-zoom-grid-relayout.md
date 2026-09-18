## Bug Report

### Summary
Changing the zoom level recalculates grid dimensions and drag bounds using a new gap, but the grid items themselves are never re-laid out. The rendered grid therefore stops matching the computed `scaledWidth`/`scaledHeight` used for bounds, which can make parts of the grid unreachable after zooming.

### Affected Code
- `src/components/Gallery/Gallery.jsx:248-252` — `calculateGapForZoom` returns 16 (≥1.0), 32 (≥0.6), 64 (else)
- `src/components/Gallery/Gallery.jsx:121-146` — `[currentZoom]` effect recalcs `gridDimensionsRef` + bounds on zoom
- `src/components/Gallery/Gallery.jsx:400-470` — `generateGridItems` sets item `left`/`top` from the gap, but is only called on mount, config (resize) change, and project/category change — never on zoom change

### Steps to Reproduce
1. Load any gallery view (default zoom 60%).
2. Click **ZOOM IN** (→ 100%, gap should become 16px).
3. Drag the grid to its far edges.

### Expected Behavior
Spacing tightens to 16px at 100% zoom and the full grid stays reachable within the computed bounds.

### Actual Behavior
Items keep the 64/32px spacing from the previous zoom while bounds are computed with the new gap, so the grid's real extent is wider than `scaledWidth` and its outer edges become unreachable (or clipping occurs).

### Suggested Fix
After `setCurrentZoom`, regenerate the grid layout (call `generateGridItems()`) so item positions match the gap used for bounds calculation, matching the pattern already used in the resize handler (Gallery.jsx:213-245).