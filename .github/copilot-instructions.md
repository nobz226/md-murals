# MD Murals - Copilot Instructions

## Project Overview
Mihai Darvasa portfolio website showcasing mural and canvas artwork. React 19 + Vite frontend with Convex backend, featuring GSAP-powered draggable gallery with zoom/detail view, category filtering (interior/exterior/canvas), About page, and admin panel for content management.

**Critical**: This is a highly interactive GSAP-based gallery. Most bugs relate to GSAP state management, Flip animations, or Convex query patterns. Always check refs cleanup and query skip patterns first.

**Tech Stack**: React 19.2.4, GSAP 3.14.2, Convex 1.31.7, Fancybox 6.1.10, React Router 7.13.0, Vite 7.3.1

## Architecture

### Stack
- **Frontend**: React 19 + Vite (port 3000)
- **Backend**: Convex (realtime database + file storage)
- **Animations**: GSAP 3.14 with Draggable, InertiaPlugin, CustomEase, Flip
- **Lightbox**: Fancybox (@fancyapps/ui ^6.1.10)
- **Routing**: React Router (/, /interior, /exterior, /canvas, /about, /admin)
- **No build tools**: No TypeScript, no test suite, no linting - keep it simple

### Data Model ([convex/schema.ts](../convex/schema.ts))
```typescript
projects: {
  title, description, category, featuredImageId?, order, createdAt, updatedAt
}
images: {
  projectId, storageId?, isFeatured, order, url
}
sounds: {
  name, type, storageId, url, updatedAt
}
```
- `category`: "interior" | "exterior" | "canvas"
- Images indexed by `projectId` for efficient queries
- Projects indexed by `category` for filtered views
- Sounds indexed by `type` for quick lookup: "click" | "open" | "close" | "zoom-in" | "zoom-out" | "drag-start" | "drag-end"

### Key Components
- **FashionGallery** ([src/components/Gallery/FashionGallery.jsx](../src/components/Gallery/FashionGallery.jsx)): GSAP-powered responsive grid with drag, zoom, and Flip-based detail view
- **ProjectDetail** ([src/components/Gallery/ProjectDetail.jsx](../src/components/Gallery/ProjectDetail.jsx)): Split-screen overlay with Fancybox lightbox for image gallery
- **About** ([src/pages/About.jsx](../src/pages/About.jsx)): Split-screen page with artist image on left, bio text on right, uses same GSAP Flip animations as ProjectDetail
- **Header** ([src/components/Header.jsx](../src/components/Header.jsx)): Hamburger menu with category navigation, About link, location, contact, and social links
- **Controls** ([src/components/Controls.jsx](../src/components/Controls.jsx)): Zoom slider (25%-100%), auto-fit button, sound toggle with canvas wave animation
- **Footer** ([src/components/Footer.jsx](../src/components/Footer.jsx)): Simple footer with artist info and coordinates
- **Admin Pages** ([src/pages/Admin.jsx](../src/pages/Admin.jsx)): ProjectForm, ProjectList, ImageUploader, SoundManager for content management
- **SoundManager** ([src/components/Admin/SoundManager.jsx](../src/components/Admin/SoundManager.jsx)): Admin interface for uploading and managing sound effects for all interactions
- **SeedButton** ([src/components/SeedButton.jsx](../src/components/SeedButton.jsx)): Dev-only tool in admin for seeding/clearing database
- **Preloader** ([src/components/Preloader.jsx](../src/components/Preloader.jsx)): Canvas-based 2s loading animation (shows once per session)

### Sound System
- **useSoundSystem** ([src/hooks/useSoundSystem.jsx](../src/hooks/useSoundSystem.jsx)): React context/hook for managing sound effects
  - Preloads all sounds from Convex database
  - `play(soundType)` - Plays specific sound if enabled
  - `toggle()` - Enables/disables sound system
  - `enabled` - Current state of sound system
- **Sound Types**: click, open, close, zoom-in, zoom-out, drag-start, drag-end
- **Admin Upload**: Upload audio files (MP3, WAV, OGG) via SoundManager in admin panel
- **Integration**: Sounds triggered throughout gallery interactions (clicks, zoom, drag, split screen open/close)

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
- Creates 39 sample projects (13 interior, 13 exterior, 13 canvas) with 4 unique Unsplash images each
- "Clear Data" button removes all projects/images and deletes storage files
- **Dev-only component** - remove before production deployment

**2. Convex Dashboard/Console**
```javascript
await mutation(api.seed.seedData)  // Seed 39 projects
await mutation(api.seed.clearData) // Clear all
```

### Project Structure
```
src/
├── components/
│   ├── Gallery/           # FashionGallery, ProjectDetail (GSAP animations)
│   └── Admin/             # ProjectForm, ImageUploader, AboutForm
├── pages/                 # Home, About, Admin (route components)
└── styles/main.css        # Global styles, no CSS modules

convex/
├── schema.ts              # Database schema (projects, images, about)
├── projects.ts            # CRUD for projects (query + mutation exports)
├── images.ts              # Image upload/management
└── about.ts               # Artist bio/profile data
```

### Adding Projects
1. Navigate to `/admin`
2. Click "+ New Project", fill form (title, description, category)
3. Upload images via ImageUploader component
4. First uploaded image auto-set as featured; change via "Set as Featured" button
5. Projects appear in grid immediately via Convex reactivity

### Managing About Page
1. Navigate to `/admin`
2. Use "About Section" form to edit:
   - Artist name/title
   - Bio text
   - Featured image
3. Changes appear immediately on `/about` page via Convex reactivity

## Convex Patterns

### Query Usage ([src/pages/Home.jsx](../src/pages/Home.jsx))
```javascript
const allProjects = useQuery(api.projects.getAllProjects);
const filtered = useQuery(api.projects.getProjectsByCategory, 
  category ? { category } : "skip");  // Conditional query
```
**Critical**: Use `"skip"` to disable queries, NOT `null` or `undefined`

### Backend Function Structure ([convex/projects.ts](../convex/projects.ts))
All Convex functions follow this pattern:
```typescript
export const functionName = query({  // or mutation
  args: {
    param: v.string(),  // Convex validators (v.string, v.number, v.id(), etc.)
    optional: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Database operations: ctx.db.query(), ctx.db.get(), ctx.db.insert()
    // Storage operations: ctx.storage.getUrl(), ctx.storage.delete()
    return result;
  }
});
```
**Validators available**: `v.string()`, `v.number()`, `v.boolean()`, `v.id("tableName")`, `v.optional()`, `v.union()`, `v.array()`, `v.literal()`

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
- **Dynamic grid calculation** based on project count:
  - Uses `calculateOptimalGrid(projects.length)` to determine rows/cols
  - Formula: `cols = Math.ceil(Math.sqrt(numProjects * 1.5))`, `rows = Math.ceil(numProjects / cols)`
  - Creates slightly wider than tall grid for better visual balance
  - Each project appears exactly once (no cycling or duplicates)
- **Fixed item size**: 320px × 320px across all viewports
- **Variable zoom levels**: 0.3 (30%), 0.6 (60%), 1.0 (100%), or auto-calculated fit zoom
- **Reactive zoom system**: 
  - `currentZoom` state triggers useEffect to recalculate grid dimensions and bounds
  - GSAP animates scale change on `canvasWrapperRef` over 0.8s
  - Draggable bounds update during animation via `onUpdate` callback
  - `initDraggable()` called on animation complete to finalize bounds
- **Auto-fit zoom**: Scales grid to fit 85% of viewport
  - Calculated via `calculateAutoFitZoom()` - uses smaller of width/height fit ratio
  - Ensures all projects visible without dragging
  - Capped at 1.0 max zoom
- Gap dynamically calculated: `zoom >= 1.0 ? 16 : zoom >= 0.6 ? 32 : 64`
- Uses refs for GSAP: `viewportRef`, `canvasWrapperRef`, `gridContainerRef`, `draggableRef`
- **zoomStateRef pattern**: Uses `useRef(zoomState)` synced via useEffect to avoid stale closures in click handlers

### Draggable Configuration
```javascript
Draggable.create(canvasWrapper, {
  type: "x,y",
  bounds: calculateBounds(),  // Forces top-left positioning when grid smaller than viewport
  inertia: true,
  throwProps: { resistance: 300 },
  onDragStart: () => document.body.classList.add("dragging")
})
```
**Always** call `initDraggable()` after zoom changes to recalculate bounds
**Bounds calculation**: Uses marginX (100px) and marginY (200px) to maintain top-left positioning

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
<Route path="/about" element={<About />} />
// category prop determines which query to use
```
Home component conditionally queries `getAllProjects` or `getProjectsByCategory`

### Header Navigation
- Category links in Header component update route, triggering query change and grid regeneration
- About link navigates to `/about` route, showing split-screen About page

## UI Controls

### Zoom Controls ([Controls.jsx](../src/components/Controls.jsx))
- **Four zoom levels**: ZOOM OUT (30%), NORMAL (60%), ZOOM IN (100%), FIT (auto-calculated)
- **Auto-fit**: Calculates optimal zoom to fit entire grid in 85% of viewport
- **Sound Toggle**: Canvas-animated waveform (feature for future audio integration)
- Position: Fixed bottom-center, moves to split-right during zoom mode

**Implementation Notes**:
- Zoom changes animate smoothly with GSAP over 0.8s duration
- Each zoom change recalculates grid dimensions, gap spacing, and draggable bounds
- `handleSetZoom(level)` updates state, triggers GSAP animation, reinitializes draggable
- `handleAutoFit()` calculates optimal zoom based on grid size vs viewport (85% target)
- `isZoomMode` prop disables controls to prevent conflicts with ProjectDetail
- Canvas animation uses `requestAnimationFrame` with color interpolation for smooth transitions
- Draggable bounds update during zoom animation via `onUpdate` callback

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
- Category route changes
- **Window resize** (uses `calculateOptimalGrid()` to recalculate grid dimensions based on project count)

Always clears `gridContainer.innerHTML` and rebuilds from scratch with exact number of projects (no duplicates)

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
- **Mobile split-screen**: Gallery grid has additional top margin (2rem) and padding (3rem) on mobile devices
- **Mobile image scaling**: `.scaling-image-overlay` constrained to max-height 50vh with object-fit: contain to ensure all featured images fit properly

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

### About Management ([AboutForm.jsx](../src/components/Admin/AboutForm.jsx))
- **Edit About content**: Artist name/title, bio text, and featured image
- **Image upload**: Same flow as project images (generateUploadUrl → POST → updateAbout)
- **Preview**: Shows current featured image with update capability
- **Backwards compatibility**: Handles both old field names (bioText, imageStorageId) and new ones (bio, storageId)

### Editing/Deleting
- **Edit**: Click "Edit" in ProjectList → Opens ProjectForm with pre-filled data
- **Delete**: Click "Delete" → Confirmation dialog → `deleteProject()` mutation removes project + all images + storage files
- **Real-time updates**: All changes reflect immediately in both admin and public gallery via Convex subscriptions

## Common Debugging Scenarios

### Quick Diagnosis Checklist
1. **Gallery issues**: Check GSAP refs cleanup, `calculateBounds()` called after grid changes
2. **Data not loading**: Verify `npm run convex` is running, check query skip pattern (`"skip"` not `null`)
3. **Upload failures**: Confirm `Content-Type` matches file MIME type, verify `storageId` in response
4. **Animation glitches**: Ensure `Flip.fit()` source element exists in DOM, check `will-change` CSS
5. **Memory leaks**: Call `Fancybox.destroy()` and `draggableRef.current.kill()` in cleanup

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
