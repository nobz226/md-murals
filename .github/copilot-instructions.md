# MD Murals - Copilot Instructions

## Project Overview
Interactive GSAP-powered draggable image gallery showcasing fashion portraits. Features zoom-in/detail view with split-screen layout, custom animations, and audio feedback.

## Architecture

### Core Components
- **FashionGallery** ([js/script.js](../js/script.js)): Main application class managing grid layout, drag interactions, zoom mode, and animations
- **PreloaderManager** ([js/script.js](../js/script.js)): Canvas-based loading animation (2s duration, radial dot pattern)
- Static grid: 8 rows × 12 columns of 320px images

### GSAP Plugin Stack
All interactions use GSAP 3.13.0 with these plugins (registered in script.js):
- `Draggable` - Grid panning with inertia
- `InertiaPlugin` - Smooth throwProps physics
- `CustomEase` - Two custom eases: `smooth (.87,0,.13,1)` and `center (.25,.46,.45,.94)`
- `Flip` - Zoom transitions between grid and detail view

## Key Patterns

### Zoom Mode System
Clicking a grid item triggers a multi-phase animation sequence:
1. Disable dragging, set `body.zoom-mode` class
2. Create `.scaling-image-overlay` div from source image
3. Use `Flip.fit()` to animate overlay into `.zoom-target` (left half of split screen)
4. Sequentially reveal title overlay: number → title → description lines (stagger 0.15s)
5. Fade in close button from right edge (x: 40 → 0, delay 0.9s)

**Exit**: Reverse Flip animation, clean up overlay, restore grid item opacity, re-enable dragging

### Zoom Levels & Gap Calculation
Zoom changes dynamically adjust spacing ([script.js#L482](../js/script.js#L482)):
```javascript
if (zoomLevel >= 1.0) return 16;      // Tight spacing
else if (zoomLevel >= 0.6) return 32; // Normal spacing (default)
else return 64;                        // Loose spacing
```

Zoom controls: `0.3` (Out), `0.6` (Normal), `1.0` (In), `autoFitZoom` (Fit)
Keyboard shortcuts: `1`, `2`, `3`, `f/F`

### Animation Timing Conventions
- **Entry animations**: Use `.customEase` for smooth deceleration
- **Center/reset moves**: Use `.centerEase` for balanced easing
- **Stagger patterns**: Grid intro uses `stagger: {from: "start", grid: [rows, cols]}`
- **Overlay text**: Lines animate from y-offset with stagger, NOT SplitText

### Sound System
Toggle-based audio with 7 sound effects ([script.js#L201](../js/script.js#L201)):
- `click`, `open`, `close`, `zoom-in`, `zoom-out`, `drag-start`, `drag-end`
- Canvas-based sound wave visualization updates at RAF, interpolates between mute/active colors
- Audio preloaded with `volume: 0.3`, only plays when `soundSystem.enabled === true`

## Development Workflow

### Running the Project
Open `index.html` directly in browser (no build step). Uses CDN resources:
- GSAP plugins from jsdelivr.net
- Fonts: PPNeueMontreal (woff2), TheGoodMonolith (cdnfonts)
- Images: CodePen assets (orange-portrait_01.jpg through _14.jpg)

### Adding New Images
1. Add URLs to `fashionImages` array ([script.js#L367](../js/script.js#L367))
2. Add metadata to `imageData` array ([script.js#L378](../js/script.js#L378)) with `{number, title, description}`
3. Images cycle via `imageIndex % fashionImages.length`

### Modifying Grid Layout
Update `config` object ([script.js#L159](../js/script.js#L159)):
```javascript
itemSize: 320,     // Item dimensions
rows: 8,           // Grid rows
cols: 12,          // Grid columns
currentZoom: 0.6   // Initial zoom
```
Grid regenerates via `generateGridItems()`, calculates bounds, reinitializes Draggable

## Common Gotchas

### Viewport Boundary Logic
`calculateBounds()` ([script.js#L903](../js/script.js#L903)) returns centering coordinates when scaled grid < viewport:
```javascript
if (scaledWidth <= vw) {
  minX = maxX = (vw - scaledWidth) / 2;  // Center horizontally
}
```
Always update bounds after zoom changes via `initDraggable()`

### Class-Based State Management
- `body.dragging` - Active drag state (cursor: grabbing)
- `body.zoom-mode` - Detail view active (cursor: default)
- `splitScreenContainer.active` - Split screen visible
- `grid-item.selected` - z-index elevation during zoom
- `grid-item.out-of-view` - IntersectionObserver controlled opacity

### Text Line Splitting
Custom `splitTextIntoLines()` function ([script.js#L457](../js/script.js#L457)) wraps text into `.description-line` spans based on container width. Does NOT use SplitText plugin. Each line animates independently with y-offset transforms.

## Styling Conventions

### CSS Custom Properties
```css
--spacing-base: 1rem
--transition-medium: 0.3s ease
--color-text-dim: 0.6 (opacity multiplier)
```

### Grid Layout
Header/footer use 12-column CSS Grid with explicit column assignments:
- `nav-section`: columns 1-3
- `values-section`: columns 5-6
- `location-section`: columns 7-8
- `contact-section`: columns 9-10
- `social-section`: columns 11-12

### Z-Index Hierarchy
```
10000: Header/footer
9998: Page vignette
100000: Preloader (removed after init)
6: Controls
5: Close button
3: Scaling overlay (zoom transition)
2: Split screen
1: Viewport/grid items
```

## Integration Points
- Images from CodePen CDN (replace with own hosting for production)
- Google Fonts integration via `@import` in CSS
- No backend/API - purely client-side
- No framework dependencies beyond GSAP

## Performance Notes
- Uses `will-change: transform` on `.canvas-wrapper` and `.grid-item`
- `IntersectionObserver` fades out-of-viewport items to opacity 0.1
- Canvas animations use `requestAnimationFrame`
- Draggable uses hardware-accelerated transforms (x/y)
