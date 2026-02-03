import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import { InertiaPlugin } from 'gsap/dist/InertiaPlugin';
import { CustomEase } from 'gsap/dist/CustomEase';
import { Flip } from 'gsap/dist/Flip';
import ProjectDetail from './ProjectDetail';
import Controls from '../Controls';
import { useSoundSystem } from '../../hooks/useSoundSystem';

// Register GSAP plugins
gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, Flip);

function Gallery({ projects, category, aboutOpen }) {
  const viewportRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const gridContainerRef = useRef(null);
  const draggableRef = useRef(null);
  
  const { play: playSound } = useSoundSystem();
  
  // Get responsive grid configuration based on viewport
  const getResponsiveConfig = () => {
    // Fixed item size like reference - 320px regardless of viewport
    return {
      itemSize: 320,
      baseGap: 16,
      currentZoom: 0.6,
      currentGap: 32
    };
  };

  // Calculate optimal grid layout for projects
  const calculateOptimalGrid = (numProjects) => {
    if (numProjects === 0) return { rows: 0, cols: 0 };
    
    // Calculate columns based on aspect ratio preference (slightly wider than tall)
    let cols = Math.ceil(Math.sqrt(numProjects * 1.5));
    
    // Limit columns to 6 on mobile viewports (600px and below)
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
      cols = Math.min(cols, 6);
    }
    
    const rows = Math.ceil(numProjects / cols);
    
    return { rows, cols };
  };
  
  const [config, setConfig] = useState(getResponsiveConfig());

  const [currentZoom, setCurrentZoom] = useState(0.6);
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
      // Force cleanup of zoom mode state
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
      // Force cleanup of zoom mode state
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

  // Handle zoom changes - recalculate grid and bounds
  useEffect(() => {
    if (!projects || projects.length === 0 || zoomState.isActive) return;
    if (!gridItemsRef.current || gridItemsRef.current.length === 0) return;

    const { rows, cols } = calculateOptimalGrid(projects.length);
    const gap = calculateGapForZoom(currentZoom);
    calculateGridDimensions(gap, rows, cols);

    // Animate zoom change on canvas wrapper
    gsap.to(canvasWrapperRef.current, {
      scale: currentZoom,
      duration: 0.8,
      ease: customEaseRef.current || 'power2.inOut',
      onUpdate: () => {
        // Update bounds during zoom animation
        if (draggableRef.current) {
          const bounds = calculateBounds();
          draggableRef.current.applyBounds(bounds);
        }
      },
      onComplete: () => {
        // Reinitialize draggable with new bounds
        initDraggable();
      }
    });
  }, [currentZoom]);

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
      // Don't handle wheel events during zoom mode or if draggable isn't initialized
      if (zoomState.isActive || !draggableRef.current) return;
      
      // Prevent default scroll behavior
      e.preventDefault();
      
      // Get current position
      const currentX = gsap.getProperty(canvasWrapperRef.current, 'x');
      const currentY = gsap.getProperty(canvasWrapperRef.current, 'y');
      
      // Calculate new position based on scroll delta
      // Invert deltaY for natural scroll direction
      const scrollSpeed = 1.5;
      let newX = currentX - e.deltaX * scrollSpeed;
      let newY = currentY - e.deltaY * scrollSpeed;
      
      // Get bounds to constrain movement
      const { rows, cols } = calculateOptimalGrid(projects.length);
      const gap = calculateGapForZoom(currentZoom);
      calculateGridDimensions(gap, rows, cols);
      const bounds = calculateBounds();
      
      // Constrain to bounds
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
      
      // Update position with smooth animation
      gsap.to(canvasWrapperRef.current, {
        x: newX,
        y: newY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      
      // Update draggable position
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
  }, [zoomState.isActive, projects, currentZoom]);

  // Handle config changes from resize (regenerate grid without intro animation)
  useEffect(() => {
    if (!projects || projects.length === 0 || !gridContainerRef.current) return;
    
    // Only regenerate if we already have items (this is a resize, not initial load)
    if (gridItemsRef.current.length > 0) {
      const { rows, cols } = calculateOptimalGrid(projects.length);
      const gap = calculateGapForZoom(currentZoom);
      calculateGridDimensions(gap, rows, cols);
      
      generateGridItems();
      
      // Make items visible immediately (skip intro animation)
      gsap.set(gridItemsRef.current.map(item => item.element), {
        opacity: 1
      });
      
      // Recalculate position and bounds
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
      const marginX = Math.max(config.currentGap * currentZoom, 100);
      const marginY = Math.max(config.currentGap * currentZoom, 200);
      const startX = marginX;
      const startY = marginY;
      
      gsap.set(canvasWrapperRef.current, { x: startX, y: startY });
      lastValidPositionRef.current.x = startX;
      lastValidPositionRef.current.y = startY;
      
      // Reinitialize draggable with new bounds
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
      scaledWidth: totalWidth * currentZoom,
      scaledHeight: totalHeight * currentZoom,
      gap: gap,
      rows: rows,
      cols: cols
    };
    
    return gridDimensionsRef.current;
  };

  // Calculate optimal zoom to fit grid in viewport
  const calculateAutoFitZoom = () => {
    if (!projects || projects.length === 0) return 0.6;
    
    const { rows, cols } = calculateOptimalGrid(projects.length);
    // Use base gap for calculation
    const gap = 32;
    const gridWidth = cols * (config.itemSize + gap) - gap;
    const gridHeight = rows * (config.itemSize + gap) - gap;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Target 85% of viewport to ensure good visibility with margins
    const targetWidth = vw * 0.85;
    const targetHeight = vh * 0.85;
    
    // Calculate zoom to fit
    const zoomToFitWidth = targetWidth / gridWidth;
    const zoomToFitHeight = targetHeight / gridHeight;
    
    // Use the smaller zoom to ensure both dimensions fit, cap at 1.0
    return Math.min(zoomToFitWidth, zoomToFitHeight, 1.0);
  };

  // Set zoom level with animation
  const handleSetZoom = (zoomLevel) => {
    if (zoomState.isActive) return;
    
    // Play zoom sound
    if (zoomLevel > currentZoom) {
      playSound('zoom-in');
    } else if (zoomLevel < currentZoom) {
      playSound('zoom-out');
    }
    
    setCurrentZoom(zoomLevel);
  };

  // Auto-fit zoom to viewport
  const handleAutoFit = () => {
    if (zoomState.isActive) return;
    const fitZoom = calculateAutoFitZoom();
    
    // Play appropriate zoom sound
    if (fitZoom > currentZoom) {
      playSound('zoom-in');
    } else if (fitZoom < currentZoom) {
      playSound('zoom-out');
    }
    
    setCurrentZoom(fitZoom);
  };

  // Calculate viewport bounds
  const calculateBounds = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
    // Increase margin to allow viewing the full grid
    const marginX = Math.max(config.currentGap * currentZoom, 100);
    const marginY = Math.max(config.currentGap * currentZoom, 200);
    
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
    const gap = calculateGapForZoom(currentZoom);
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
        playSound('drag-start');
        lastValidPositionRef.current.x = draggableRef.current.x;
        lastValidPositionRef.current.y = draggableRef.current.y;
      },
      onDrag: () => {
        lastValidPositionRef.current.x = draggableRef.current.x;
        lastValidPositionRef.current.y = draggableRef.current.y;
      },
      onDragEnd: () => {
        document.body.classList.remove("dragging");
        playSound('drag-end');
      }
    })[0];
  };

  // Generate grid items from projects
  const generateGridItems = () => {
    const { rows, cols } = calculateOptimalGrid(projects.length);
    const gap = calculateGapForZoom(currentZoom);
    calculateGridDimensions(gap, rows, cols);

    if (!canvasWrapperRef.current || !gridContainerRef.current) return;

    const canvasWrapper = canvasWrapperRef.current;
    const gridContainer = gridContainerRef.current;

    canvasWrapper.style.width = gridDimensionsRef.current.width + 'px';
    canvasWrapper.style.height = gridDimensionsRef.current.height + 'px';

    gridContainer.innerHTML = '';
    gridItemsRef.current = [];

    // Create items only for available projects (no cycling/duplicates)
    let itemIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Stop if we've used all available projects
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
              playSound('click');
              enterZoomMode(itemData);
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
    playSound('open');
    
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
    playSound('close');
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

    // Use fixed zoom like reference (0.6)
    gsap.set(canvasWrapperRef.current, { scale: currentZoom });

    const { rows, cols } = calculateOptimalGrid(projects.length);
    const gap = calculateGapForZoom(currentZoom);
    calculateGridDimensions(gap, rows, cols);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
    
    // Position grid with slight offset from top-left instead of center
    const marginX = Math.max(config.currentGap * currentZoom, 100);
    const marginY = Math.max(config.currentGap * currentZoom, 200);
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

      <Controls
        currentZoom={currentZoom}
        setCurrentZoom={handleSetZoom}
        isZoomMode={zoomState.isActive}
        onAutoFit={handleAutoFit}
      />

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

export default Gallery;
