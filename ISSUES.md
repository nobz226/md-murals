## Gallery & Interaction Issues
- Close split-screen by clicking on the background
- Scale all images in split screen
- Add blur to gallery images
- Make bottom panel disappear when in split screen view
- Fix Fancybox for split screen view

## Navigation & UI Issues
- Cannot close hamburger menu on mobile
- Remove bottom panel on mobile or restyle ??

## Content & Typography Issues
- Add subtitle to main header title
- Make text bigger
- Studio = About   About = Bio
- Add phone number for Connect
- Make email and phone number directly visible on mobile

## Responsive Design Issues
- Make responsive for tablets
- Double click to open gallery item in Samsung Phones

## Performance Optimizations
- Remove duplicate FashionGallery.jsx attachment in copilot-instructions.md (file is listed twice)
- Preload project images on hover for faster split-screen transitions
- Debounce window resize handler in Gallery.jsx to prevent excessive recalculations
- Consider lazy loading images in gallery grid (currently all images load immediately)
- Use IntersectionObserver cleanup in Gallery.jsx (observer never disconnected on unmount)
- Optimize GSAP animations by killing previous animations before creating new ones in zoom transitions
- Consider using CSS transform instead of GSAP for simple opacity changes

## Code Quality & Maintainability
- Extract magic numbers to constants (320px item size, zoom levels 0.3/0.6/1.0, gaps 16/32/64)
- Consolidate duplicate color values across CSS (#2a2a2a, #1a1a1a appear multiple times)
- Remove unused CSS rules (`.grid-item.selected` z-index rule seems unused)
- Split large Gallery.jsx component into smaller focused components (DraggableGrid, ZoomControls, etc.)
- Remove commented/dead code if any exists
- Add error boundaries for Gallery and Admin components
- Consolidate mobile menu styles (duplicated between base and @media query)

## Accessibility Issues
- Add aria-labels to navigation links
- Add keyboard navigation for gallery grid (arrow keys to navigate items)
- Add focus indicators for interactive elements (currently removed with outline: none)
- Close button needs aria-label="Close project detail"
- Add skip-to-content link for keyboard users
- Improve color contrast for dimmed text (0.6 opacity may fail WCAG)
- Add alt text requirements/validation in admin image uploader

## State Management Issues
- Remove unnecessary ref sync in Gallery.jsx (zoomStateRef synced with zoomState every render)
- Consider using useReducer for complex zoomState object instead of multiple useState calls
- Cleanup GSAP animations in useEffect dependencies (missing cleanup in some effects)
- Sound system plays sounds even when disabled (check useSoundSystem enabled check timing)

## Browser Compatibility
- Add -webkit-backdrop-filter vendor prefix (already present but check browser support fallback)
- Consider fallback for CSS mask property in .scaling-image-overlay img
- Test Fancybox compatibility across browsers
- Add feature detection for IntersectionObserver

## Admin Panel Issues
- Add loading states for image uploads (progress bar instead of just "Uploading...")
- Add image preview before upload
- Add bulk delete for images
- Add drag-and-drop reordering for images
- Validate file types before upload (currently only checks after selection)
- Add image size limits and compression
- Add confirmation dialog for project updates
- Show toast notifications instead of alert() dialogs
- Add undo functionality for delete operations

## Database & Data Issues
- Add pagination for projects if count grows large
- Add search/filter in admin panel
- Add draft/published status for projects
- Add image optimization on upload (resize, compress)
- Consider CDN for image hosting instead of Convex storage for better performance
- Add data validation in Convex mutations (currently only frontend validation)

## SEO & Metadata Issues
- Add meta tags for social sharing (Open Graph, Twitter Cards)
- Add structured data for artwork
- Add sitemap.xml generation
- Add robots.txt
- Add canonical URLs
- Add page titles and descriptions per route
- Add image alt text to schema

## Animation & UX Polish
- Add loading skeleton for gallery while projects load
- Add empty state messaging when no projects in category
- Add transition between category changes (currently instant)
- Add micro-interactions for button hovers
- Reduce animation duration on slower devices
- Add prefers-reduced-motion media query support
- Add haptic feedback on mobile interactions

## Mobile-Specific Issues
- Test swipe gestures for gallery navigation
- Improve touch target sizes (some buttons may be too small)
- Add pull-to-refresh functionality
- Test orientation change handling
- Optimize for notched devices (safe area insets)
- Add mobile-specific zoom limits

## Development Workflow
- Add ESLint configuration
- Add Prettier configuration
- Add pre-commit hooks for code formatting
- Add component documentation/Storybook
- Add TypeScript for better type safety
- Add unit tests for utility functions
- Add E2E tests for critical user flows
- Add bundle size analyzer