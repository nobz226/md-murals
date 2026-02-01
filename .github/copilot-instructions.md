# MD Murals - Copilot Instructions

## Project Overview
Mihai Darvasa portfolio website showcasing mural and canvas artwork. React + Vite frontend with Convex backend, featuring GSAP-powered draggable gallery with zoom/detail view, category filtering (interior/exterior/canvas), and admin panel for content management.

## Architecture

### Stack
- **Frontend**: React 19 + Vite (port 3000)
- **Backend**: Convex (realtime database + file storage)
- **Animations**: GSAP 3.14 with Draggable, InertiaPlugin, CustomEase, Flip
- **Routing**: React Router (/, /interior, /exterior, /canvas, /admin)

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
- **FashionGallery** ([src/components/Gallery/FashionGallery.jsx](../src/components/Gallery/FashionGallery.jsx)): GSAP-powered 8×12 grid with drag, zoom, and Flip-based detail view
- **ProjectDetail**: Split-screen overlay showing project info (rendered during zoom mode)
- **Admin Pages** ([src/pages/Admin.jsx](../src/pages/Admin.jsx)): ProjectForm, ProjectList, ImageUploader for content management
- **Preloader** ([src/components/Preloader.jsx](../src/components/Preloader.jsx)): Canvas-based 2s loading animation

## Development Workflow

### Running Locally
```bash
# Terminal 1: Convex backend
npm run convex

# Terminal 2: Vite dev server
npm run dev  # → http://localhost:3000
```
**Required**: `VITE_CONVEX_URL` environment variable (set by Convex CLI)

### Database Seeding
Use `convex/seed.ts` mutation to populate initial data:
```javascript
// In browser console or via Convex dashboard:
await mutation(api.seed.seedData)
```
Creates 3 sample projects (one per category) with placeholder Unsplash images

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
- `getAllProjects` query auto-fetches first image if no featured set
- Admin sets featured via `setFeaturedImage` mutation

## GSAP Gallery Interactions

### Grid System ([FashionGallery.jsx](../src/components/Gallery/FashionGallery.jsx))
- 8 rows × 12 columns of 320px items
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
6. Exit via close button or clicking split areas: Reverse Flip back to grid, cleanup overlay, restore draggable

**Critical**: Overlay must be created in DOM before Flip, then removed after reverse animation completes

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
