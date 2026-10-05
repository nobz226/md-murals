# MD Murals - Copilot Instructions

## Project Overview
Portfolio website for Mihai Darvasa, showcasing mural and canvas artwork. React 19 + Vite frontend with a Convex backend. Features a GSAP-powered draggable gallery with a Flip-based split-screen detail view, category filtering (interior/exterior/canvas), an About panel, and a password-protected admin dashboard.

**Tech stack**: React 19, GSAP 3.14 (Draggable, InertiaPlugin, CustomEase, Flip), Convex 1.41, Fancybox 6, React Router 7, Vite 7. No TypeScript on the frontend, no test suite, no linting.

## Running Locally
```bash
npm install
npm run convex   # Terminal 1: Convex dev server (writes VITE_CONVEX_URL to .env.local on first run)
npm run dev      # Terminal 2: Vite on http://localhost:3000
```
Admin access needs a password set on the Convex deployment:
```bash
npx convex env set ADMIN_PASSWORD "<password>"   # once per deployment (dev and prod)
```
Then open `/admin`, log in, and use **Dev Tools** (only shown in `npm run dev`) to seed sample data.

**Deploying**: `npx convex deploy` for the backend (set `ADMIN_PASSWORD` on prod too), and Vercel builds the frontend (`vercel.json` rewrites all routes to `index.html`). `dist/` is not committed.

## File Map
```
convex/
  schema.ts            projects, images, sounds (unused by the UI), about, gallerySettings
  adminAuth.ts         ADMIN_PASSWORD check: adminKeyArg, assertAdmin(), checkAdminKey query
  projects.ts          queries (sorted by `order`, with featuredImage) + admin mutations
  images.ts            upload URL, save/delete/reorder images
  about.ts             About page content + photo
  gallerySettings.ts   single-row grid/hover settings with defaults
  seed.ts              seedData / seedSounds / clearData (admin only)
src/
  App.jsx              routes; /admin is lazy-loaded
  utils/gsap.js        registers GSAP plugins once; exports smoothEase / centerEase
  pages/Home.jsx       queries projects (skips the unused query), owns About open state
  pages/Admin.jsx      AdminProvider, login gate, sidebar sections
  components/Gallery/
    Gallery.jsx        imperative DOM grid, drag/wheel/resize, opens ProjectDetail
    ProjectDetail.jsx  Flip overlay into split screen + Fancybox lightbox
    AboutDetail.jsx    About split screen
    detailAnimations.jsx  shared title in/out animations + close icon
  components/Admin/
    AdminContext.jsx   admin key, toasts, useAdminMutation, uploadFile
    LoginScreen.jsx, ProjectsPanel.jsx, ProjectEditor.jsx (drawer), ImageManager.jsx,
    GalleryControls.jsx, AboutForm.jsx, DevTools.jsx (dev only), categories.js
  styles/main.css      public site
  styles/admin.css     admin only, scoped under .admin
```

## Convex Patterns

### Admin-only mutations
Every mutation that changes data takes `adminKey` and calls `assertAdmin` first:
```ts
export const deleteProject = mutation({
  args: { ...adminKeyArg, id: v.id("projects") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    ...
  },
});
```
On the frontend, call these via `useAdminMutation(api.x.y)`, which adds the key and logs out on `Unauthorized`. Queries are public.

### Query skipping
❌ `useQuery(api.foo, null)` or `useQuery(api.foo, undefined)`
✅ `useQuery(api.foo, condition ? { args } : "skip")`

### Uploads
`generateUploadUrl` → `uploadFile(url, file)` (in AdminContext) → save mutation with the `storageId`. `images.saveImage` assigns the next `order` and makes the project's first image its featured image. `images.deleteImage` promotes the next image if the featured one is deleted.

### Ordering
`projects.order` and `images.order` drive display order. Queries sort by it. Reorder with `reorderProjects` / `reorderImages` by passing the full id list in its new order.

## Gallery (Gallery.jsx)
- Fixed zoom of 0.6, gap 32px, margins 100px (x) / 200px (y). Tile size comes from `gallerySettings.tileSize`.
- `calculateGrid()`: rows come from settings. Columns come from settings but grow if there are too many projects, so nothing is hidden. On phones (≤600px), columns are automatic.
- Only projects with a `featuredImage` get tiles.
- `layoutGrid({ intro })` is the single place that sizes, positions and builds the grid. It runs with the intro animation when projects, category or settings change (after settings have loaded), and without it on a debounced resize.
- Drag bounds: locked at the start position when the grid fits the viewport, otherwise free between both edges.
- Window listeners are registered once and read the latest render's functions through refs (`layoutGridRef`, `calculateBoundsRef`).
- `selected` state (`{ project, item }`) opens `ProjectDetail`. It's cleared during render when the category changes or About opens, so the `zoom-mode` body class hands over in a single commit.

## Detail Views
- ProjectDetail's opening animation runs once on mount. It creates `.scaling-image-overlay`, uses `Flip.fit` into `.zoom-target`, then animates the title in. The cleanup clears the Fancybox timer, calls `Fancybox.destroy()`, removes the overlay and restores the source image.
- Closing reverses the Flip back to the grid tile, then calls `onClose`. A `closingRef` guard prevents double closes.
- Escape closes the detail (or About) with its animation, unless the Fancybox lightbox is open.
- The `zoom-mode` body class is managed by effects: Gallery while a project is open, Home while About is open.

## Styling
- `main.css` sets global `a`, `p`, `h3` and `user-select: none` styles for the public site. `admin.css` undoes these inside `.admin`.
- The admin adds `body.admin-page` to restore normal page scrolling.

## Common Gotchas
- Kill and recreate Draggable via `initDraggable()` after any layout change. It stays disabled if a project is open.
- Convex storage URLs can be `null` from `ctx.storage.getUrl`. Handle that before saving.
- The PPNeueMontreal font is loaded from codepen's CDN, which blocks other origins via CORS, so it falls back to a system sans-serif.
