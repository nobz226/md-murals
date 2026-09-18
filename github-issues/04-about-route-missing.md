## Bug Report

### Summary
`/about` is documented as a route (`.github/copilot-instructions.md`) and a full `src/pages/About.jsx` implementation exists, but it is never registered in `App.jsx`. Navigating directly to `/about` renders an empty page, and the About page component is effectively dead code.

### Affected Code
- `src/App.jsx:12-16` — routes registered: `/`, `/interior`, `/exterior`, `/canvas`, `/admin` (no `/about`)
- `src/pages/About.jsx` — implemented but unreachable

### Steps to Reproduce
1. Start the dev server (`npm run dev`).
2. Visit `http://localhost:3000/about`.

### Expected Behavior
Either the About page renders (add `<Route path="/about" element={<About />} />`), or the docs and unused component are cleaned up.

### Actual Behavior
No matching route → blank screen.

### Suggested Fix
Register the route in `App.jsx`, or remove `pages/About.jsx` and update the docs if the About overlay (`AboutDetail`) is the intended approach.