import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { gsap, Draggable, centerEase } from '../../utils/gsap';
import ProjectDetail from './ProjectDetail';

// Fixed zoom level (no zoom controls)
const ZOOM = 0.6;
const GAP = 32;
const MARGIN_X = 100;
const MARGIN_Y = 200;
const DEFAULT_TILE_SIZE = 320;
const DEFAULT_ROWS = 3;

// Work out rows/cols for the grid. Columns grow if the admin-configured grid
// is too small for every project, and empty trailing rows are dropped.
function calculateGrid(numProjects, settings) {
  if (numProjects === 0) return { rows: 0, cols: 0 };

  const adminRows = settings?.rows || DEFAULT_ROWS;
  const isMobile = window.innerWidth <= 600;

  let rows = Math.min(adminRows, numProjects);
  let cols = isMobile || !settings?.cols
    ? Math.ceil(numProjects / rows)
    : settings.cols;

  if (rows * cols < numProjects) cols = Math.ceil(numProjects / rows);
  rows = Math.ceil(numProjects / cols);

  return { rows, cols };
}

function Gallery({ projects, category, aboutOpen }) {
  const viewportRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const gridContainerRef = useRef(null);
  const draggableRef = useRef(null);
  const gridItemsRef = useRef([]);
  const layoutRef = useRef(null);
  const introTimersRef = useRef([]);

  const gallerySettings = useQuery(api.gallerySettings.getGallerySettings);
  const itemSize = gallerySettings?.tileSize || DEFAULT_TILE_SIZE;
  const startPosition = gallerySettings?.startPosition || 'left';

  // The project currently open in the detail view ({ project, item }) or null
  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Close the detail view when the category changes or About opens.
  // Done during render so the body class handoff happens in a single commit.
  const [prevCategory, setPrevCategory] = useState(category);
  if (category !== prevCategory) {
    setPrevCategory(category);
    setSelected(null);
  }
  if (aboutOpen && selected) {
    setSelected(null);
  }

  // Only projects with an image get a tile
  const getVisibleProjects = () => projects.filter((p) => p.featuredImage);

  // Grid size in unscaled and scaled pixels
  const calculateLayout = () => {
    const { rows, cols } = calculateGrid(getVisibleProjects().length, gallerySettings);
    const width = Math.max(cols * (itemSize + GAP) - GAP, 0);
    const height = Math.max(rows * (itemSize + GAP) - GAP, 0);
    return { rows, cols, width, height, scaledWidth: width * ZOOM, scaledHeight: height * ZOOM };
  };

  // Drag bounds: locked to the start position when the grid fits the viewport,
  // otherwise free to travel between both edges.
  const calculateBounds = (layout) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = layout;

    let minX, maxX;
    if (scaledWidth <= vw) {
      if (startPosition === 'center') minX = maxX = (vw - scaledWidth) / 2;
      else if (startPosition === 'right') minX = maxX = vw - scaledWidth - MARGIN_X;
      else minX = maxX = MARGIN_X;
    } else {
      minX = vw - scaledWidth - MARGIN_X;
      maxX = MARGIN_X;
    }

    let minY, maxY;
    if (scaledHeight <= vh) {
      minY = maxY = MARGIN_Y;
    } else {
      minY = vh - scaledHeight - MARGIN_Y;
      maxY = MARGIN_Y;
    }

    return { minX, maxX, minY, maxY };
  };

  const calculateStartPosition = (layout) => {
    const vw = window.innerWidth;
    const bounds = calculateBounds(layout);
    let x;
    if (startPosition === 'center') x = (vw - layout.scaledWidth) / 2;
    else if (startPosition === 'right') x = vw - layout.scaledWidth - MARGIN_X;
    else x = MARGIN_X;
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: MARGIN_Y
    };
  };

  const initDraggable = () => {
    if (draggableRef.current) draggableRef.current.kill();

    draggableRef.current = Draggable.create(canvasWrapperRef.current, {
      type: 'x,y',
      bounds: calculateBounds(layoutRef.current),
      edgeResistance: 0.8,
      inertia: true,
      throwProps: {
        x: { velocity: 'auto', resistance: 300, end: (endValue) => Math.round(endValue) },
        y: { velocity: 'auto', resistance: 300, end: (endValue) => Math.round(endValue) }
      },
      onDragStart: () => document.body.classList.add('dragging'),
      onDragEnd: () => document.body.classList.remove('dragging')
    })[0];

    if (selectedRef.current) draggableRef.current.disable();
  };

  const createGridItem = (project, x, y) => {
    const item = document.createElement('div');
    item.className = 'grid-item';
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    item.style.width = `${itemSize}px`;
    item.style.height = `${itemSize}px`;
    item.style.opacity = '0';

    const img = document.createElement('img');
    img.src = project.featuredImage.url;
    img.alt = project.title;
    item.appendChild(img);

    const itemData = { element: item, img, baseX: x, baseY: y, project };

    item.addEventListener('click', () => {
      if (!selectedRef.current) {
        setSelected({ project, item: itemData });
      }
    });

    // Hover zoom effect using GSAP (avoids inline style conflicts)
    const tileHover = gallerySettings?.enableTileHoverZoom !== false;
    const imageHover = gallerySettings?.enableImageHoverZoom !== false;
    let hoverTimeout = null;

    item.addEventListener('mouseenter', () => {
      if (selectedRef.current) return;
      if (tileHover) {
        gsap.to(item, { scale: 1.08, duration: 0.3, ease: centerEase, overwrite: 'auto' });
      }
      // Delayed image zoom (3 seconds)
      if (imageHover) {
        hoverTimeout = setTimeout(() => {
          gsap.to(img, { scale: 1.15, duration: 2, ease: centerEase, overwrite: 'auto' });
        }, 3000);
      }
    });
    item.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      if (selectedRef.current) return;
      if (tileHover) {
        gsap.to(item, { scale: 1, duration: 0.3, ease: centerEase, overwrite: 'auto' });
      }
      if (imageHover) {
        gsap.to(img, { scale: 1, duration: 0.5, ease: centerEase, overwrite: 'auto' });
      }
    });

    return itemData;
  };

  // Rebuild grid items from projects
  const generateGridItems = (layout) => {
    const gridContainer = gridContainerRef.current;
    gridContainer.innerHTML = '';
    gridItemsRef.current = [];

    getVisibleProjects().forEach((project, index) => {
      const row = Math.floor(index / layout.cols);
      const col = index % layout.cols;
      const itemData = createGridItem(project, col * (itemSize + GAP), row * (itemSize + GAP));
      gridContainer.appendChild(itemData.element);
      gridItemsRef.current.push(itemData);
    });
  };

  const clearIntroTimers = () => {
    introTimersRef.current.forEach(clearTimeout);
    introTimersRef.current = [];
  };

  // Items fly out from the screen centre into their grid positions
  const playIntroAnimation = (layout) => {
    const canvasX = gsap.getProperty(canvasWrapperRef.current, 'x');
    const canvasY = gsap.getProperty(canvasWrapperRef.current, 'y');
    const centerX = (window.innerWidth / 2 - canvasX) / ZOOM - itemSize / 2;
    const centerY = (window.innerHeight / 2 - canvasY) / ZOOM - itemSize / 2;

    const items = gridItemsRef.current;
    if (!items.length) return;
    items.forEach((itemData, index) => {
      gsap.set(itemData.element, {
        left: centerX,
        top: centerY,
        scale: 0.8,
        zIndex: items.length - index,
        opacity: 0
      });
    });

    gsap.to(items.map((item) => item.element), {
      duration: 0.2,
      left: (index) => items[index].baseX,
      top: (index) => items[index].baseY,
      scale: 1,
      opacity: 1,
      ease: 'power2.out',
      stagger: { amount: 1.5, from: 'start', grid: [layout.rows, layout.cols] },
      onComplete: () => {
        items.forEach((itemData) => gsap.set(itemData.element, { zIndex: 1 }));
      }
    });
  };

  // Size, position and populate the grid, optionally with the intro animation
  const layoutGrid = ({ intro }) => {
    if (!canvasWrapperRef.current || !gridContainerRef.current) return;

    clearIntroTimers();
    const layout = calculateLayout();
    layoutRef.current = layout;

    const canvasWrapper = canvasWrapperRef.current;
    canvasWrapper.style.width = `${layout.width}px`;
    canvasWrapper.style.height = `${layout.height}px`;
    const start = calculateStartPosition(layout);
    gsap.set(canvasWrapper, { scale: ZOOM, x: start.x, y: start.y });

    generateGridItems(layout);

    if (!intro) {
      gsap.set(gridItemsRef.current.map((item) => item.element), { opacity: 1 });
      initDraggable();
      return;
    }

    gsap.set(viewportRef.current, { opacity: 0 });
    gsap.to(viewportRef.current, {
      duration: 0.6,
      opacity: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        playIntroAnimation(layout);
        introTimersRef.current.push(setTimeout(initDraggable, 1500));
      }
    });
  };

  // Latest versions of render-scoped functions, for long-lived window listeners
  const layoutGridRef = useRef(layoutGrid);
  layoutGridRef.current = layoutGrid;
  const calculateBoundsRef = useRef(calculateBounds);
  calculateBoundsRef.current = calculateBounds;

  // Build the grid with the intro when projects, category or settings change.
  // Waits for gallery settings so the grid isn't built twice on load.
  useEffect(() => {
    if (gallerySettings === undefined) return;

    // The grid is being rebuilt, so the open item no longer exists
    if (selectedRef.current) setSelected(null);
    layoutGrid({ intro: true });

    return () => {
      clearIntroTimers();
      if (draggableRef.current) {
        draggableRef.current.kill();
        draggableRef.current = null;
      }
    };
  }, [
    projects,
    category,
    gallerySettings === undefined,
    itemSize,
    startPosition,
    gallerySettings?.rows,
    gallerySettings?.cols,
    gallerySettings?.enableTileHoverZoom,
    gallerySettings?.enableImageHoverZoom
  ]);

  // Window listeners: resize rebuilds without the intro, wheel pans the grid
  useEffect(() => {
    let resizeTimer = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!selectedRef.current) layoutGridRef.current({ intro: false });
      }, 150);
    };

    const handleWheel = (e) => {
      if (selectedRef.current || !draggableRef.current || !layoutRef.current) return;
      if (document.body.classList.contains('zoom-mode')) return;

      e.preventDefault();

      const bounds = calculateBoundsRef.current(layoutRef.current);
      const scrollSpeed = 1.5;
      const currentX = gsap.getProperty(canvasWrapperRef.current, 'x');
      const currentY = gsap.getProperty(canvasWrapperRef.current, 'y');
      const newX = Math.max(bounds.minX, Math.min(bounds.maxX, currentX - e.deltaX * scrollSpeed));
      const newY = Math.max(bounds.minY, Math.min(bounds.maxY, currentY - e.deltaY * scrollSpeed));

      gsap.to(canvasWrapperRef.current, {
        x: newX,
        y: newY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => draggableRef.current?.update()
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // While a project is open: lock dragging and switch the body to zoom mode
  useEffect(() => {
    if (!selected) return;
    draggableRef.current?.disable();
    document.body.classList.add('zoom-mode');
    return () => {
      draggableRef.current?.enable();
      document.body.classList.remove('zoom-mode');
    };
  }, [selected]);

  return (
    <>
      <div className="viewport" id="viewport" ref={viewportRef}>
        <div className="canvas-wrapper" id="canvasWrapper" ref={canvasWrapperRef}>
          <div className="grid-container" id="gridContainer" ref={gridContainerRef}>
            {/* Grid items generated dynamically */}
          </div>
        </div>
      </div>

      {selected && (
        <ProjectDetail
          key={selected.project._id}
          project={selected.project}
          selectedItem={selected.item}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

export default Gallery;
