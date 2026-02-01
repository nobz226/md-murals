import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import { InertiaPlugin } from 'gsap/dist/InertiaPlugin';
import { CustomEase } from 'gsap/dist/CustomEase';
import { Flip } from 'gsap/dist/Flip';
import Controls from '../Controls';
import ProjectDetail from './ProjectDetail';

// Register GSAP plugins
gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, Flip);

function FashionGallery({ projects, category }) {
  const viewportRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const gridContainerRef = useRef(null);
  const draggableRef = useRef(null);
  
  const [config] = useState({
    itemSize: 320,
    baseGap: 16,
    rows: 8,
    cols: 12,
    currentZoom: 0.6,
    currentGap: 32
  });

  const [zoomState, setZoomState] = useState({
    isActive: false,
    selectedProject: null,
    selectedItem: null,
    flipAnimation: null,
    scalingOverlay: null
  });

  const [currentZoom, setCurrentZoom] = useState(0.6);
  const gridItemsRef = useRef([]);
  const gridDimensionsRef = useRef({});
  const lastValidPositionRef = useRef({ x: 0, y: 0 });
  const customEaseRef = useRef(null);
  const centerEaseRef = useRef(null);

  // Initialize custom eases
  useEffect(() => {
    customEaseRef.current = CustomEase.create("smooth", ".87,0,.13,1");
    centerEaseRef.current = CustomEase.create("center", ".25,.46,.45,.94");
  }, []);

  // Calculate gap based on zoom level
  const calculateGapForZoom = (zoomLevel) => {
    if (zoomLevel >= 1.0) return 16;
    else if (zoomLevel >= 0.6) return 32;
    else return 64;
  };

  // Calculate grid dimensions
  const calculateGridDimensions = (gap) => {
    const totalWidth = config.cols * (config.itemSize + gap) - gap;
    const totalHeight = config.rows * (config.itemSize + gap) - gap;
    
    gridDimensionsRef.current = {
      width: totalWidth,
      height: totalHeight,
      scaledWidth: totalWidth * currentZoom,
      scaledHeight: totalHeight * currentZoom,
      gap: gap
    };
    
    return gridDimensionsRef.current;
  };

  // Calculate viewport bounds
  const calculateBounds = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
    const marginX = config.currentGap * currentZoom;
    const marginY = config.currentGap * currentZoom;
    
    let minX, maxX, minY, maxY;
    
    if (scaledWidth <= vw) {
      const centerX = (vw - scaledWidth) / 2;
      minX = maxX = centerX;
    } else {
      maxX = marginX;
      minX = vw - scaledWidth - marginX;
    }
    
    if (scaledHeight <= vh) {
      const centerY = (vh - scaledHeight) / 2;
      minY = maxY = centerY;
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

    const gap = calculateGapForZoom(currentZoom);
    calculateGridDimensions(gap);
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
    const gap = calculateGapForZoom(currentZoom);
    config.currentGap = gap;
    calculateGridDimensions(gap);

    if (!canvasWrapperRef.current || !gridContainerRef.current) return;

    const canvasWrapper = canvasWrapperRef.current;
    const gridContainer = gridContainerRef.current;

    canvasWrapper.style.width = gridDimensionsRef.current.width + 'px';
    canvasWrapper.style.height = gridDimensionsRef.current.height + 'px';

    gridContainer.innerHTML = '';
    gridItemsRef.current = [];

    let projectIndex = 0;
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const item = document.createElement('div');
        item.className = 'grid-item';

        const x = col * (config.itemSize + gap);
        const y = row * (config.itemSize + gap);

        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        item.style.opacity = '0';

        const project = projects[projectIndex % projects.length];
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
            if (!zoomState.isActive) {
              enterZoomMode(itemData);
            }
          });

          gridContainer.appendChild(item);
          gridItemsRef.current.push(itemData);
        }
        
        projectIndex++;
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
          grid: [config.rows, config.cols]
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
    console.log('FashionGallery - projects:', projects);
    console.log('FashionGallery - category:', category);
    
    if (!projects || projects.length === 0) {
      console.log('FashionGallery - No projects, skipping initialization');
      return;
    }

    gsap.set(viewportRef.current, { opacity: 0 });
    gsap.set(canvasWrapperRef.current, { scale: currentZoom });

    const gap = calculateGapForZoom(currentZoom);
    calculateGridDimensions(gap);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = gridDimensionsRef.current;
    const centerX = (vw - scaledWidth) / 2;
    const centerY = (vh - scaledHeight) / 2;

    gsap.set(canvasWrapperRef.current, { x: centerX, y: centerY });
    lastValidPositionRef.current.x = centerX;
    lastValidPositionRef.current.y = centerY;

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
        setCurrentZoom={setCurrentZoom}
        isZoomMode={zoomState.isActive}
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

export default FashionGallery;
