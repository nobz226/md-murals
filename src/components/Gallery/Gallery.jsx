import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import { InertiaPlugin } from 'gsap/dist/InertiaPlugin';
import { CustomEase } from 'gsap/dist/CustomEase';
import { Flip } from 'gsap/dist/Flip';
import ProjectDetail from './ProjectDetail';

// Register GSAP plugins
gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, Flip);

function FashionGallery({ projects, category, aboutOpen }) {
  const viewportRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const gridContainerRef = useRef(null);
  const draggableRef = useRef(null);
  
  // Fixed zoom level (no zoom controls)
  const FIXED_ZOOM = 0.6;

  // Get responsive grid configuration based on viewport
  const getResponsiveConfig = () => {
    return {
      itemSize: 320,
      baseGap: 16,
      currentGap: 32
    };
  };

  // Calculate optimal grid layout for projects
  const calculateOptimalGrid = (numProjects) => {
    if (numProjects === 0) return { rows: 0, cols: 0 };
    
    let cols = Math.ceil(Math.sqrt(numProjects * 1.5));
    
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
      cols = Math.min(cols, 6);
    }
    
    const rows = Math.ceil(numProjects / cols);
    
    return { rows, cols };
  };
  
  const [config, setConfig] = useState(getResponsiveConfig());

  const [zoomState, setZoomState] = useState({
    isActive: false,
    selectedProject: null,
    selectedItem: null,
    flipAnimation: null,
    scalingOverlay: null
  });
  const zoomStateRef = useRef(zoomState);

  const gridItemsRef = useRef([]);
  const gridDimensionsRef = useRef({});
  const lastValidPositionRef = useRef({ x: 0, y: 0 });
  const customEaseRef = useRef(null);
  const centerEaseRef = useRef(null);

  // Keep zoomStateRef in sync with zoomState
  useEffect(() => {
    zoomStateRef.current = zoomState;
  }, [zoomState]);

  // Close zoom mode when category changes (navigation)
  useEffect(() => {
    if (zoomState.isActive) {
      setZoomState({
        isActive: false,
        selectedProject: null,
        selectedItem: null,
        flipAnimation: null,
        scalingOverlay: null
      });
      
      if (draggableRef.current) draggableRef.current.enable();
      document.body.classList.remove('zoom-mode');
    }
  }, [category]);

  // Close zoom mode when About is opened
  useEffect(() => {
    if (aboutOpen && zoomState.isActive) {
      setZoomState({
        isActive: false,
        selectedProject: null,
        selectedItem: null,
        flipAnimation: null,
        scalingOverlay: null
      });
      
      if (draggableRef.current) draggableRef.current.enable();
      document.body.classList.remove('zoom-mode');
    }
  }, [aboutOpen]);

  // Close zoom mode with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && zoomState.isActive) {
        exitZoomMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomState.isActive]);

  // Initialize custom eases
  useEffect(() => {
    customEaseRef.current = CustomEase.create("smooth", ".87,0,.13,1");
    centerEaseRef.current = CustomEase.create("center", ".25,.46,.45,.94");
    
    // Handle window resize
    const handleResize = () => {
      if (zoomState.isActive) return;
      
      const newConfig = getResponsiveConfig();
      setConfig(newConfig);
    };
    
    // Handle scroll wheel for gallery navigation
    const handleWheel = (e) => {
      if (zoomState.isActive || !draggableRef.current) return;
      
      e.preventDefault();
      
      const currentX = gsap.getProperty(canvasWrapperRef.current, 'x');
      const currentY = gsap.getProperty(canvasWrapperRef.current, 'y');
      
      const scrollSpeed = 1.5;
      let newX = currentX - e.deltaX * scrollSpeed;
      let newY = currentY - e.deltaY * scrollSpeed;
      
      const { rows, cols } = calculateOptimalGrid(projects.length);
      const gap = calculateGapForZoom(FIXED_ZOOM);
      calculateGridDimensions(gap, rows, cols);
      const bounds = calculateBounds();
      
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
      
      gsap.to(canvasWrapperRef.current, {
        x: newX,
        y: newY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      
      if (draggableRef.current) {
        draggableRef.current.update();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [zoomState.isActive, projects]);

  // Handle config changes from resize (regenerate grid without intro animation)
  useEffect(() => {
    if (!projects || projects.length === 0 || !gridContainerRef.current) return;
    
    if (gridItemsRef.current.length > 0) {
      const { rows, cols } = calculateOptimalGrid(projects.length);
      const gap = calculateGapForZoom(FIXED_ZOOM);
      calculateGridDimensions(gap, rows, cols);
      
      generateGridItems();
      
      gsap.set(gridItemsRef.current.map(item => item.element), {
        opacity: 1
      });
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
      const marginX = Math.max(config.currentGap * FIXED_ZOOM, 100);
      const marginY = Math.max(config.currentGap * FIXED_ZOOM, 200);
      const startX = marginX;
      const startY = marginY;
      
      gsap.set(canvasWrapperRef.current, { x: startX, y: startY });
      lastValidPositionRef.current.x = startX;
      lastValidPositionRef.current.y = startY;
      
      initDraggable();
    }
  }, [config]);

  // Calculate gap based on zoom level
  const calculateGapForZoom = (zoomLevel) => {
    if (zoomLevel >= 1.0) return 16;
    else if (zoomLevel >= 0.6) return 32;
    else return 64;
  };

  // Calculate grid dimensions
  const calculateGridDimensions = (gap, rows, cols) => {
    const totalWidth = cols * (config.itemSize + gap) - gap;
    const totalHeight = rows * (config.itemSize + gap) - gap;
    
    gridDimensionsRef.current = {
      width: totalWidth,
      height: totalHeight,
      scaledWidth: totalWidth * FIXED_ZOOM,
      scaledHeight: totalHeight * FIXED_ZOOM,
      gap: gap,
      rows: rows,
      cols: cols
    };
    
    return gridDimensionsRef.current;
  };

  // Calculate viewport bounds
  const calculateBounds = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
    const marginX = Math.max(config.currentGap * FIXED_ZOOM, 100);
    const marginY = Math.max(config.currentGap * FIXED_ZOOM, 200);
    
    let minX, maxX, minY, maxY;
    
    if (scaledWidth <= vw) {
      minX = maxX = marginX;
    } else {
      maxX = marginX;
      minX = vw - scaledWidth - marginX;
    }
    
    if (scaledHeight <= vh) {
      minY = maxY = marginY;
    } else {
      maxY = marginY;
      minY = vh - scaledHeight - marginY;
    }
    
    return { minX, maxX, minY, maxY };
  };

  // Initialize draggable
  const initDraggable = () => {
    if (draggableRef.current) {
      draggableRef.current.kill();
    }

    const { rows, cols } = calculateOptimalGrid(projects.length);
    const gap = calculateGapForZoom(FIXED_ZOOM);
    calculateGridDimensions(gap, rows, cols);
    const bounds = calculateBounds();

    draggableRef.current = Draggable.create(canvasWrapperRef.current, {
      type: "x,y",
      bounds: bounds,
      edgeResistance: 0.8,
      inertia: true,
      throwProps: {
        x: {
          velocity: "auto",
          resistance: 300,
          end: (endValue) => Math.round(endValue)
        },
        y: {
          velocity: "auto",
          resistance: 300,
          end: (endValue) => Math.round(endValue)
        }
      },
      onDragStart: () => {
        document.body.classList.add("dragging");
        lastValidPositionRef.current.x = draggableRef.current.x;
        lastValidPositionRef.current.y = draggableRef.current.y;
      },
      onDrag: () => {
        lastValidPositionRef.current.x = draggableRef.current.x;
        lastValidPositionRef.current.y = draggableRef.current.y;
      },
      onDragEnd: () => {
        document.body.classList.remove("dragging");
      }
    })[0];
  };

  // Generate grid items from projects
  const generateGridItems = () => {
    const { rows, cols } = calculateOptimalGrid(projects.length);
    const gap = calculateGapForZoom(FIXED_ZOOM);
    calculateGridDimensions(gap, rows, cols);

    if (!canvasWrapperRef.current || !gridContainerRef.current) return;

    const canvasWrapper = canvasWrapperRef.current;
    const gridContainer = gridContainerRef.current;

    canvasWrapper.style.width = gridDimensionsRef.current.width + 'px';
    canvasWrapper.style.height = gridDimensionsRef.current.height + 'px';

    gridContainer.innerHTML = '';
    gridItemsRef.current = [];

    let itemIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (itemIndex >= projects.length) {
          return;
        }

        const item = document.createElement('div');
        item.className = 'grid-item';

        const x = col * (config.itemSize + gap);
        const y = row * (config.itemSize + gap);

        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        item.style.width = `${config.itemSize}px`;
        item.style.height = `${config.itemSize}px`;
        item.style.opacity = '0';

        const project = projects[itemIndex];
        if (project && project.featuredImage) {
          const img = document.createElement('img');
          img.src = project.featuredImage.url;
          img.alt = project.title;
          item.appendChild(img);

          const itemData = {
            element: item,
            img: img,
            row: row,
            col: col,
            baseX: x,
            baseY: y,
            project: project,
            index: gridItemsRef.current.length
          };

          // Add click event
          item.addEventListener('click', () => {
            if (!zoomStateRef.current.isActive) {
              enterZoomMode(itemData);
            }
          });

          // Hover zoom effect using GSAP (avoids inline style conflicts)
          let hoverTimeout = null;
          
          item.addEventListener('mouseenter', () => {
            if (!zoomStateRef.current.isActive) {
              gsap.to(item, { scale: 1.08, duration: 0.3, ease: 'center', overwrite: 'auto' });
              
              // Delayed image zoom (3 seconds)
              hoverTimeout = setTimeout(() => {
                gsap.to(img, { scale: 1.15, duration: 2, ease: 'center', overwrite: 'auto' });
              }, 3000);
            }
          });
          item.addEventListener('mouseleave', () => {
            if (!zoomStateRef.current.isActive) {
              gsap.to(item, { scale: 1, duration: 0.3, ease: 'center', overwrite: 'auto' });
              gsap.to(img, { scale: 1, duration: 0.5, ease: 'center', overwrite: 'auto' });
              if (hoverTimeout) clearTimeout(hoverTimeout);
            }
          });

          gridContainer.appendChild(item);
          gridItemsRef.current.push(itemData);
        }
        
        itemIndex++;
      }
    }
  };

  // Enter zoom mode
  const enterZoomMode = (itemData) => {
    console.log('enterZoomMode called', itemData);
    
    setZoomState(prev => {
      const newState = {
        ...prev,
        isActive: true,
        selectedProject: itemData.project,
        selectedItem: itemData
      };
      console.log('New zoom state:', newState);
      return newState;
    });

    if (draggableRef.current) draggableRef.current.disable();
    document.body.classList.add('zoom-mode');
  };

  // Exit zoom mode
  const exitZoomMode = () => {
    setZoomState({
      isActive: false,
      selectedProject: null,
      selectedItem: null,
      flipAnimation: null,
      scalingOverlay: null
    });

    if (draggableRef.current) draggableRef.current.enable();
    document.body.classList.remove('zoom-mode');
  };

  // Intro animation
  const playIntroAnimation = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const screenCenterX = vw / 2;
    const screenCenterY = vh / 2;

    const canvasStyle = getComputedStyle(canvasWrapperRef.current);
    const canvasMatrix = new DOMMatrix(canvasStyle.transform);
    const canvasX = canvasMatrix.m41;
    const canvasY = canvasMatrix.m42;
    const canvasScale = canvasMatrix.a;

    const centerX = (screenCenterX - canvasX) / canvasScale - config.itemSize / 2;
    const centerY = (screenCenterY - canvasY) / canvasScale - config.itemSize / 2;

    gridItemsRef.current.forEach((itemData, index) => {
      const zIndex = gridItemsRef.current.length - index;
      gsap.set(itemData.element, {
        left: centerX,
        top: centerY,
        scale: 0.8,
        zIndex: zIndex,
        opacity: 0
      });
    });

    const { rows, cols } = calculateOptimalGrid(projects.length);
    
    gsap.to(
      gridItemsRef.current.map(item => item.element),
      {
        duration: 0.2,
        left: (index) => gridItemsRef.current[index].baseX,
        top: (index) => gridItemsRef.current[index].baseY,
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        stagger: {
          amount: 1.5,
          from: "start",
          grid: [rows, cols]
        },
        onComplete: () => {
          gridItemsRef.current.forEach((itemData) => {
            gsap.set(itemData.element, { zIndex: 1 });
          });
        }
      }
    );
  };

  // Initialize on mount and when projects change
  useEffect(() => {
    if (!projects || projects.length === 0) {
      return;
    }

    gsap.set(viewportRef.current, { opacity: 0 });

    gsap.set(canvasWrapperRef.current, { scale: FIXED_ZOOM });

    const { rows, cols } = calculateOptimalGrid(projects.length);
    const gap = calculateGapForZoom(FIXED_ZOOM);
    calculateGridDimensions(gap, rows, cols);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
    
    const marginX = Math.max(config.currentGap * FIXED_ZOOM, 100);
    const marginY = Math.max(config.currentGap * FIXED_ZOOM, 200);
    const startX = marginX;
    const startY = marginY;

    gsap.set(canvasWrapperRef.current, { x: startX, y: startY });
    lastValidPositionRef.current.x = startX;
    lastValidPositionRef.current.y = startY;

    generateGridItems();

    gsap.to(viewportRef.current, {
      duration: 0.6,
      opacity: 1,
      ease: "power2.inOut",
      onComplete: () => {
        playIntroAnimation();

        setTimeout(() => {
          initDraggable();
        }, 1500);
      }
    });

    return () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }
    };
  }, [projects, category]);

  return (
    <>
      <div className="viewport" id="viewport" ref={viewportRef}>
        <div className="canvas-wrapper" id="canvasWrapper" ref={canvasWrapperRef}>
          <div className="grid-container" id="gridContainer" ref={gridContainerRef}>
            {/* Grid items generated dynamically */}
          </div>
        </div>
      </div>
      
      {zoomState.isActive && zoomState.selectedProject && zoomState.selectedItem && (
        <ProjectDetail
          project={zoomState.selectedProject}
          selectedItem={zoomState.selectedItem}
          customEase={customEaseRef.current}
          onClose={exitZoomMode}
        />
      )}
    </>
  );
}

export default FashionGallery;