import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { gsap, Flip, smoothEase } from '../../utils/gsap';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { animateTitleIn, animateTitleOut, CloseIcon } from './detailAnimations';

function ProjectDetail({ project, selectedItem, onClose }) {
  // Fetch all images for this project
  const projectImages = useQuery(api.images.getProjectImages, { projectId: project._id });
  const splitContainerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const imageTitleOverlayRef = useRef(null);
  const scalingOverlayRef = useRef(null);
  const closingRef = useRef(false);

  // Opening animation: runs once when the detail view mounts
  useEffect(() => {
    const sourceImg = selectedItem.img;

    // Create scaling overlay from source image
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
    scalingOverlayRef.current = overlay;

    // Hide source image while the overlay stands in for it
    gsap.set(sourceImg, { opacity: 0 });

    const splitContainer = splitContainerRef.current;
    const zoomTarget = splitContainer.querySelector('.zoom-target');

    gsap.to(splitContainer, { opacity: 1, duration: 1.2, ease: smoothEase });

    // Flip animation from grid item to zoom target, then reveal the title
    Flip.fit(overlay, zoomTarget, {
      duration: 1.2,
      ease: smoothEase,
      absolute: true,
      onComplete: () => {
        if (imageTitleOverlayRef.current) animateTitleIn(imageTitleOverlayRef.current, 0.1);
      }
    });

    gsap.fromTo(closeButtonRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.9 }
    );

    // Bind the lightbox once the opening animation has finished
    const fancyboxTimer = setTimeout(() => {
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

    return () => {
      clearTimeout(fancyboxTimer);
      Fancybox.destroy();
      gsap.killTweensOf(overlay);
      overlay.remove();
      scalingOverlayRef.current = null;
      // Restore source image visibility
      gsap.set(sourceImg, { opacity: 1 });
    };
  }, []);

  const handleClose = () => {
    if (closingRef.current || !scalingOverlayRef.current) return;
    closingRef.current = true;

    animateTitleOut(imageTitleOverlayRef.current);

    gsap.to(closeButtonRef.current, { duration: 0.3, opacity: 0, x: 40, ease: 'power2.in' });
    gsap.to(splitContainerRef.current, { opacity: 0, duration: 0.8, ease: 'power2.out' });

    // Reverse Flip animation back to grid item; unmount cleans up the overlay
    Flip.fit(scalingOverlayRef.current, selectedItem.element, {
      duration: 1.2,
      ease: smoothEase,
      absolute: true,
      onComplete: onClose
    });
  };

  // Close with Escape (unless the lightbox is open and handles it itself)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !Fancybox.getInstance()) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

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
        aria-label="Close project"
        style={{ opacity: 0 }}
      >
        <CloseIcon />
      </button>
    </>
  );
}

export default ProjectDetail;
