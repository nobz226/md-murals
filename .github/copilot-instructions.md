# MD Murals - Copilot Instructions

## Project Overview
Mihai Darvasa portfolio website showcasing mural and canvas artwork. React 19 + Vite frontend with Convex backend, featuring GSAP-powered draggable gallery with zoom/detail view, category filtering (interior/exterior/canvas), and admin panel for content management.

**Critical**: This is a highly interactive GSAP-based gallery. Most bugs relate to GSAP state management, Flip animations, or Convex query patterns. Always check refs cleanup and query skip patterns first.

**Tech Stack**: React 19.2.4, GSAP 3.14.2, Convex 1.31.7, Fancybox 6.1.10, React Router 7.13.0, Vite 7.3.1

## Architecture

### Stack
- **Frontend**: React 19 + Vite (port 3000)
- **Backend**: Convex (realtime database + file storage)
- **Animations**: GSAP 3.14 with Draggable, InertiaPlugin, CustomEase, Flip
- **Lightbox**: Fancybox (@fancyapps/ui ^6.1.10)
- **Routing**: React Router (/, /interior, /exterior, /canvas, /admin)
- **No build tools**: No TypeScript, no test suite, no linting - keep it simple

### Data Model ([convex/schema.ts](../convex/schema.ts))
```typescript
projects: {
  title, description, category, featuredImageId?, order, createdAt, updatedAt
}
images: {
  projectId, storageId?, isFeatured, order, url
}
```
- `category`: "interior" | "exterior" | "canvas"
- Images indexed by `projectId` for efficient queries
- Projects indexed by `category` for filtered views

### Key Components
- **FashionGallery** ([src/components/Gallery/FashionGallery.jsx](../src/components/Gallery/FashionGallery.jsx)): GSAP-powered responsive grid with drag, zoom, and Flip-based detail view
- **ProjectDetail** ([src/components/Gallery/ProjectDetail.jsx](../src/components/Gallery/ProjectDetail.jsx)): Split-screen overlay with Fancybox lightbox for image gallery
- **Header** ([src/components/Header.jsx](../src/components/Header.jsx)): Hamburger menu with category navigation, location, contact, and social links
- **Controls** ([src/components/Controls.jsx](../src/components/Controls.jsx)): Zoom slider (25%-100%), auto-fit button, sound toggle with canvas wave animation
- **Footer** ([src/components/Footer.jsx](../src/components/Footer.jsx)): Simple footer with artist info and coordinates
- **Admin Pages** ([src/pages/Admin.jsx](../src/pages/Admin.jsx)): ProjectForm, ProjectList, ImageUploader for content management
- **SeedButton** ([src/components/SeedButton.jsx](../src/components/SeedButton.jsx)): Dev-only tool in admin for seeding/clearing database
- **Preloader** ([src/components/Preloader.jsx](../src/components/Preloader.jsx)): Canvas-based 2s loading animation (shows once per session)

## Development Workflow

### Running Locally
```bash
# Terminal 1: Convex backend (REQUIRED - starts on first run)
npm run convex  # Spawns dev server, watches schema changes

# Terminal 2: Vite dev server
npm run dev  # → http://localhost:3000
```
**Environment**: No `.env` needed - `VITE_CONVEX_URL` auto-set by Convex CLI on first `npm run convex`  
**First-time setup**: 
1. `npm install` - Install all dependencies
2. `npm run convex` - Initializes Convex (prompts for account/project if first time)
3. Open new terminal → `npm run dev` - Start Vite dev server
4. Navigate to `/admin` → Use SeedButton to populate database with sample data

### Build & Deployment
```bash
npm run build   # Production build with Vite → dist/
npm run preview # Preview production build locally
```
**Convex deployment**: Separate from Vite. Use `npx convex deploy` (requires Convex account)
**Important**: Convex backend must be deployed independently before deploying frontend

### Database Seeding
Two methods to seed database:

**1. SeedButton Component (Recommended)**
- Navigate to `/admin`
- Use "Seed Database" button in fixed top-right panel
- Creates 3 sample projects with Unsplash placeholder images
- "Clear Data" button removes all projects/images and deletes storage files
- **Dev-only component** - remove before production deployment

**2. Convex Dashboard/Console**
```javascript
await mutation(api.seed.seedData)  // Seed
await mutation(api.seed.clearData) // Clear all
```

**Seed creates**: 3 projects (interior/exterior/canvas) with 3 images each, using placeholder Unsplash URLs

### Adding Projects
1. Navigate to `/admin`
2. Click "+ New Project", fill form (title, description, category)
3. Upload images via ImageUploader component
4. First uploaded image auto-set as featured; change via "Set as Featured" button
5. Projects appear in grid immediately via Convex reactivity

## Convex Patterns

### Query Usage ([src/pages/Home.jsx](../src/pages/Home.jsx))
```javascript
const allProjects = useQuery(api.projects.getAllProjects);
const filtered = useQuery(api.projects.getProjectsByCategory, 
  category ? { category } : "skip");  // Conditional query
```
**Critical**: Use `"skip"` to disable queries, NOT `null` or `undefined`

### Mutation Pattern ([src/components/Admin/ImageUploader.jsx](../src/components/Admin/ImageUploader.jsx))
```javascript
// 1. Generate upload URL
const uploadUrl = await generateUploadUrl();

// 2. Upload file to Convex storage
const result = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'Content-Type': file.type },
  body: file
});

// 3. Save image record with storageId
const { storageId } = await result.json();
await saveImage({ projectId, storageId, order });
```
Storage URLs auto-generated via `ctx.storage.getUrl(storageId)` in backend

### Featured Image Handling
- `projects.featuredImageId` is optional (can be null)
- **Both query functions** (`getAllProjects` and `getProjectsByCategory`) include featured image enrichment:
  - First tries to fetch via `featuredImageId` if set
  - Falls back to first image from `images` table if no featured set
  - Returns `null` if project has no images
- Admin sets featured via `setFeaturedImage` mutation
- ImageUploader auto-sets first uploaded image as featured for new projects

## GSAP Gallery Interactions

### Grid System ([FashionGallery.jsx](../src/components/Gallery/FashionGallery.jsx))
- **Responsive breakpoints** (auto-recalculates on window resize):
  - Mobile (≤600px): 6×4 grid, 200px items
  - Tablet (≤900px): 7×8 grid, 250px items
  - Small Desktop (≤1400px): 8×10 grid, 280px items
  - Large Desktop (>1400px): 8×12 grid, 320px items
- Gap dynamically calculated: `zoom >= 1.0 ? 16 : zoom >= 0.6 ? 32 : 64`
- Projects cycle via `projectIndex % projects.length` to fill grid
- Uses refs for GSAP: `viewportRef`, `canvasWrapperRef`, `gridContainerRef`, `draggableRef`

### Draggable Configuration
```javascript
Draggable.create(canvasWrapper, {
  type: "x,y",
  bounds: calculateBounds(),  // Centers grid if smaller than viewport
  inertia: true,
  throwProps: { resistance: 300 },
  onDragStart: () => document.body.classList.add("dragging")
})
```
**Always** call `initDraggable()` after zoom changes to recalculate bounds

### Zoom Mode Flow
1. Click grid item → `enterZoomMode(itemData)`
2. Set `zoomState.isActive`, disable draggable, add `body.zoom-mode` class
3. ProjectDetail component creates `.scaling-image-overlay` from source image
4. `Flip.fit()` animates overlay from grid position into `.zoom-target` (left 50vw of split screen)
5. Stagger-animate title overlay (category → title → description, 0.15s delays)
6. Initialize Fancybox lightbox with `data-fancybox="gallery"` for all project images
7. Exit via close button or clicking split areas: Reverse Flip back to grid, cleanup overlay/Fancybox, restore draggable

**Critical**: 
- Overlay must be created in DOM before Flip, then removed after reverse animation completes
- Fancybox.destroy() must be called in cleanup to prevent memory leaks
- Use `setTimeout` to initialize Fancybox after Flip animation completes (1200ms)

### Custom Eases (Registered in useEffect)
```javascript
customEaseRef.current = CustomEase.create("smooth", ".87,0,.13,1");
centerEaseRef.current = CustomEase.create("center", ".25,.46,.45,.94");
```
Use `smooth` for entry animations, `center` for reset/centering moves

## Routing & Category Filtering

### Route Structure ([App.jsx](../src/App.jsx))
```jsx
<Route path="/" element={<Home />} />
<Route path="/interior" element={<Home category="interior" />} />
// category prop determines which query to use
```
Home component conditionally queries `getAllProjects` or `getProjectsByCategory`

### Header Navigation
Category links in Header component update route, triggering query change and grid regeneration

## UI Controls

### Zoom Controls ([Controls.jsx](../src/components/Controls.jsx))
- **Slider**: 25%-100% zoom (disabled during zoom mode)
- **Auto-fit**: Calculates optimal zoom to fit entire grid in viewport
- **Sound Toggle**: Canvas-animated waveform (feature for future audio integration)
- Position: Fixed bottom-center, moves to split-right during zoom mode

**Implementation Notes**:
- **Current behavior**: Fixed zoom at 0.6 (60%) - zoom controls UI exists but functionality is limited to auto-fit
- `isZoomMode` prop disables controls to prevent conflicts with ProjectDetail
- `onAutoFit` callback triggers `calculateGridDimensions()` + bounds recalculation
- Canvas animation uses `requestAnimationFrame` with color interpolation for smooth transitions

### Header Navigation ([Header.jsx](../src/components/Header.jsx))
- Hamburger menu with category links, studio info, contact, and social links
- Category links update route (/, /interior, /exterior, /canvas) triggering query change
- Menu state managed with `useState` - `menuOpen` toggles `.menu-open` class for mobile responsiveness

## Common Gotchas

### Convex Query Skipping
❌ `useQuery(api.foo, null)` or `useQuery(api.foo, undefined)`  
✅ `useQuery(api.foo, condition ? { args } : "skip")`

### GSAP State Management
- Use refs (`draggableRef.current.kill()`) to cleanup before reinitializing
- Store last valid position in `lastValidPositionRef` to prevent snap-back on boundary changes
- Always call `calculateGridDimensions()` before `calculateBounds()`

### Image URL Generation
- Convex storage URLs are async (`await ctx.storage.getUrl()`)
- URLs stored in `images.url` field for frontend access
- Delete images via `ctx.storage.delete(storageId)` before removing DB record

### Grid Regeneration
Triggered on:
- Projects data changes (Convex reactivity)
- Zoom level changes
- Category route changes
- **Window resize** (uses `getResponsiveConfig()` to recalculate grid dimensions)

Always clears `gridContainer.innerHTML` and rebuilds from scratch

## File Upload Flow
1. User selects files in ImageUploader
2. Call `generateUploadUrl` mutation → get upload URL
3. POST file to upload URL with `Content-Type: image/*`
4. Extract `storageId` from response
5. Call `saveImage` mutation with `{ projectId, storageId, order }`
6. Convex generates public URL and stores in `images.url`

## Performance Considerations
- Grid uses `opacity: 0` initialization, then GSAP stagger animation
- `IntersectionObserver` fades out-of-view items to `opacity: 0.1`
- `will-change: transform` on animated elements
- Draggable uses hardware-accelerated `x/y` transforms
- Convex queries auto-subscribe; components re-render on data changes

## Styling & CSS Patterns

### Global Styles ([src/styles/main.css](../src/styles/main.css))
- **Body states**: `.dragging` (cursor changes, disables pointer events during drag), `.zoom-mode` (hides controls, shows split screen)
- **Grid items**: `.grid-item` (absolute positioned, hardware-accelerated transforms), `.grid-item.out-of-view` (reduced opacity)
- **Split screen**: `.split-screen-container` (hidden by default), `.split-screen-container.active` (Flex layout with 50/50 split)
- **Custom properties**: Uses CSS variables for colors, spacing, and breakpoints (defined in `:root`)

### Responsive Design
- **Mobile-first approach**: Base styles for mobile, media queries for larger screens
- **Breakpoints**: 600px (tablet), 900px (small desktop), 1400px (large desktop)
- **Grid recalculation**: `getResponsiveConfig()` in FashionGallery adjusts item size, gap, rows/cols based on viewport
- **Header menu**: Hamburger toggles `.menu-open` class for mobile navigation overlay

### Animation States
- **GSAP-driven**: Most animations use GSAP instead of CSS transitions for precise control
- **Flip animations**: Zoom mode uses GSAP Flip plugin for morphing between grid and detail view
- **Preloader**: Canvas-based radial pulse animation ([Preloader.jsx](../src/components/Preloader.jsx)) shows once per session via `sessionStorage`

## Admin Panel Workflow

### Creating Projects ([Admin.jsx](../src/pages/Admin.jsx), [ProjectForm.jsx](../src/components/Admin/ProjectForm.jsx))
1. Click "+ New Project" button in admin dashboard
2. Fill form: title, description, category (interior/exterior/canvas)
3. Submit creates project, keeps form open for image upload
4. Use ImageUploader component to add images (multiple files supported)
5. First uploaded image auto-set as featured; change via "Set as Featured" button
6. Close form - projects appear in gallery immediately via Convex reactivity

### Image Management ([ImageUploader.jsx](../src/components/Admin/ImageUploader.jsx))
- **Upload flow**: 
  1. `generateUploadUrl()` mutation → get signed upload URL
  2. POST file to URL with `Content-Type: image/*`
  3. Extract `storageId` from response
  4. `saveImage()` mutation stores record with generated public URL
- **Featured image**: Blue border indicates featured; click "Set Featured" on any image to change
- **Grid display**: Shows all project images in responsive grid with aspect ratio preservation

### Editing/Deleting
- **Edit**: Click "Edit" in ProjectList → Opens ProjectForm with pre-filled data
- **Delete**: Click "Delete" → Confirmation dialog → `deleteProject()` mutation removes project + all images + storage files
- **Real-time updates**: All changes reflect immediately in both admin and public gallery via Convex subscriptions

## Common Debugging Scenarios

### Gallery Not Rendering
1. **Check Convex connection**: Ensure `npm run convex` is running in separate terminal
2. **Verify data**: Use Convex dashboard to check if projects exist in database
3. **Query skip pattern**: If using category filter, ensure query isn't skipped with `null`/`undefined` - use `"skip"` string
4. **Console errors**: Check for GSAP plugin registration errors (Draggable, Flip, InertiaPlugin)

### Grid Layout Issues
- **Responsive config**: Check `getResponsiveConfig()` breakpoint matching current viewport
- **Refs not initialized**: Ensure `viewportRef`, `canvasWrapperRef`, `gridContainerRef` are set before GSAP calls
- **Window resize**: Grid regenerates on resize - verify `handleResize` cleanup isn't causing flicker

### Zoom Mode Problems
- **Overlay not appearing**: Verify `scalingOverlayRef.current` is created before Flip animation
- **Reverse animation fails**: Check that source image element still exists in DOM
- **Fancybox conflicts**: Ensure `Fancybox.destroy()` is called in cleanup to prevent memory leaks
- **Split screen not hiding**: Verify `body.zoom-mode` class is removed in `exitZoomMode()`

### Convex Upload Failures
1. **Storage URL generation**: Check `generateUploadUrl()` returns valid URL
2. **Content-Type mismatch**: Ensure file MIME type matches upload header
3. **Storage ID extraction**: Verify `storageId` exists in fetch response JSON
4. **URL generation**: `ctx.storage.getUrl(storageId)` can return `null` - handle gracefully

### Performance Degradation
- **Too many grid items**: Check if `rows × cols` creates excessive DOM nodes
- **Animation frame loops**: Verify `requestAnimationFrame` cleanup in useEffect returns
- **Draggable not killed**: Always call `draggableRef.current.kill()` before reinitializing
- **IntersectionObserver**: Check observer is disconnected on unmount
