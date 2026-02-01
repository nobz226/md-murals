import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

function ProjectDetail({ project, onClose }) {
  const splitContainerRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  const projectWithImages = useQuery(api.projects.getProject, { id: project._id });

  useEffect(() => {
    // Initialize Fancybox
    if (projectWithImages?.images) {
      Fancybox.bind('[data-fancybox="gallery"]', {
        // Fancybox options
      });
    }

    return () => {
      Fancybox.destroy();
    };
  }, [projectWithImages]);

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!projectWithImages) return null;

  return (
    <>
      <div 
        className="split-screen-container active" 
        ref={splitContainerRef}
      >
        <div className="split-left" onClick={handleOverlayClick}>
          <div className="zoom-target">
            {projectWithImages.images && projectWithImages.images.length > 0 && (
              <a 
                href={projectWithImages.images[0].url} 
                data-fancybox="gallery"
                data-caption={project.title}
              >
                <img 
                  src={projectWithImages.images[0].url} 
                  alt={project.title}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </a>
            )}
            {projectWithImages.images && projectWithImages.images.slice(1).map((image, index) => (
              <a 
                key={image._id}
                href={image.url} 
                data-fancybox="gallery"
                data-caption={project.title}
                style={{ display: 'none' }}
              >
                <img src={image.url} alt={`${project.title} - ${index + 2}`} />
              </a>
            ))}
          </div>
        </div>
        <div className="split-right" onClick={handleOverlayClick}></div>
      </div>

      <div className="image-title-overlay active">
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
      >
        <svg width="64" height="64" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z" fill="white" />
        </svg>
      </button>
    </>
  );
}

export default ProjectDetail;
