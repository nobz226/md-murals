import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

gsap.registerPlugin(Flip);

function ProjectDetail({ project, selectedItem, onClose, customEase }) {
  // Fetch all images for this project
  const projectImages = useQuery(api.images.getProjectImages, { projectId: project._id });
  const splitContainerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const imageTitleOverlayRef = useRef(null);
  const scalingOverlayRef = useRef(null);

  useEffect(() => {
    if (!selectedItem || !project || !projectImages) return;

    // Create scaling overlay from source image
    const createScalingOverlay = (sourceImg) => {
      const overlay = document.createElement('div');
      overlay.className = 'scaling-image-overlay';
      overlay.style.backgroundImage = `url(${sourceImg.src})`;
      overlay.style.backgroundSize = 'cover';
      overlay.style.backgroundPosition = '50% 50%';
      const img = document.createElement('img');
      img.src = sourceImg.src;
      img.alt = sourceImg.alt;
      overlay.appendChild(img);
      document.body.appendChild(overlay);
      
      const sourceRect = sourceImg.getBoundingClientRect();
      gsap.set(overlay, {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        opacity: 1
      });
      
      return overlay;
    };

    // Hide source image
    gsap.set(selectedItem.img, { opacity: 0 });

    // Create and animate scaling overlay
    const scalingOverlay = createScalingOverlay(selectedItem.img);
    scalingOverlayRef.current = scalingOverlay;

    const splitContainer = splitContainerRef.current;
    const zoomTarget = splitContainer.querySelector('.zoom-target');

    // Animate split screen container
    gsap.to(splitContainer, {
      opacity: 1,
      duration: 1.2,
      ease: customEase || 'power2.inOut'
    });

    // Flip animation from grid item to zoom target
    Flip.fit(scalingOverlay, zoomTarget, {
      duration: 1.2,
      ease: customEase || 'power2.inOut',
      absolute: true,
      onComplete: () => {
        // After Flip completes, animate title overlay
        const overlayElement = imageTitleOverlayRef.current;
        const numberElement = overlayElement.querySelector('.image-slide-number span');
        const titleElement = overlayElement.querySelector('.image-slide-title h1');
        const descriptionElement = overlayElement.querySelector('.description-line');

        gsap.set(numberElement, { y: 20, opacity: 0 });
        gsap.set(titleElement, { y: 60, opacity: 0 });
        gsap.set(descriptionElement, { y: 20, opacity: 0 });

        gsap.to(numberElement, {
          duration: 0.6,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          delay: 0.1
        });

        gsap.to(titleElement, {
          duration: 0.6,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          delay: 0.25
        });

        gsap.to(descriptionElement, {
          duration: 0.6,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          delay: 0.4
        });

        gsap.to(overlayElement, {
          opacity: 1,
          duration: 0.3
        });
      }
    });

    // Animate close button
    gsap.fromTo(closeButtonRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.9 }
    );

    // Initialize Fancybox after animations
    setTimeout(() => {
      Fancybox.bind('[data-fancybox="gallery"]', {
        infinite: true,
        Toolbar: {
          display: {
            left: [],
            middle: [],
            right: ['close'],
          },
        },
      });
    }, 1200);

    // Cleanup
    return () => {
      if (scalingOverlayRef.current) {
        scalingOverlayRef.current.remove();
      }
      Fancybox.destroy();
    };
  }, [selectedItem, project, customEase, projectImages]);

  const handleClose = () => {
    if (!selectedItem || !scalingOverlayRef.current) return;

    const overlayElement = imageTitleOverlayRef.current;
    const numberElement = overlayElement.querySelector('.image-slide-number span');
    const titleElement = overlayElement.querySelector('.image-slide-title h1');
    const descriptionElement = overlayElement.querySelector('.description-line');

    // Hide title overlay
    gsap.to(overlayElement, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    });

    gsap.to(numberElement, {
      duration: 0.4,
      y: -20,
      opacity: 0,
      ease: 'power2.out'
    });

    gsap.to(titleElement, {
      duration: 0.4,
      y: -60,
      opacity: 0,
      ease: 'power2.out'
    });

    gsap.to(descriptionElement, {
      duration: 0.4,
      y: -20,
      opacity: 0,
      ease: 'power2.out'
    });

    // Hide close button
    gsap.to(closeButtonRef.current, {
      duration: 0.3,
      opacity: 0,
      x: 40,
      ease: 'power2.in'
    });

    // Hide split screen
    gsap.to(splitContainerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    // Reverse Flip animation back to grid item
    Flip.fit(scalingOverlayRef.current, selectedItem.element, {
      duration: 1.2,
      ease: customEase || 'power2.inOut',
      absolute: true,
      onComplete: () => {
        // Restore source image
        gsap.set(selectedItem.img, { opacity: 1 });
        
        // Remove overlay
        if (scalingOverlayRef.current) {
          scalingOverlayRef.current.remove();
          scalingOverlayRef.current = null;
        }

        // Call parent close
        onClose();
      }
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!project) return null;

  return (
    <>
      <div 
        className="split-screen-container active" 
        ref={splitContainerRef}
        style={{ opacity: 0 }}
      >
        <div className="split-left" onClick={handleOverlayClick}>
          <div className="zoom-target" id="zoomTarget">
            {/* Image will be animated here via Flip */}
          </div>
        </div>
        <div className="split-right">
          <div className="gallery-grid">
            {projectImages && projectImages.map((image, index) => (
              <a
                key={image._id}
                href={image.url}
                data-fancybox="gallery"
                data-caption={`${project.title} - Image ${index + 1}`}
                className="gallery-item"
              >
                <img src={image.url} alt={`${project.title} ${index + 1}`} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="image-title-overlay" ref={imageTitleOverlayRef} style={{ opacity: 0 }}>
        <div className="image-slide-number">
          <span>{project.category.toUpperCase()}</span>
        </div>
        <div className="image-slide-title">
          <h1>{project.title}</h1>
        </div>
        <div className="image-slide-description">
          <span className="description-line">{project.description}</span>
        </div>
      </div>

      <button 
        className="close-button active" 
        ref={closeButtonRef}
        onClick={handleClose}
        style={{ opacity: 0 }}
      >
        <svg width="64" height="64" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z" fill="white" />
        </svg>
      </button>
    </>
  );
}

export default ProjectDetail;
