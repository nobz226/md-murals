import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useSoundSystem } from '../hooks/useSoundSystem';

function About() {
  const about = useQuery(api.about.getAbout);
  const navigate = useNavigate();
  const { play: playSound } = useSoundSystem();
  const splitContainerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleOverlayRef = useRef(null);

  useEffect(() => {
    if (!about) return;

    playSound('open');
    document.body.classList.add('zoom-mode');

    const splitContainer = splitContainerRef.current;
    
    // Animate split screen container
    gsap.to(splitContainer, {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.inOut'
    });

    // Animate title overlay
    const overlayElement = titleOverlayRef.current;
    if (overlayElement) {
      const categoryElement = overlayElement.querySelector('.image-slide-number span');
      const titleElement = overlayElement.querySelector('.image-slide-title h1');
      const descriptionElement = overlayElement.querySelector('.description-line');

      gsap.set(categoryElement, { y: 20, opacity: 0 });
      gsap.set(titleElement, { y: 60, opacity: 0 });
      gsap.set(descriptionElement, { y: 20, opacity: 0 });

      gsap.to(categoryElement, {
        duration: 0.6,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 0.3
      });

      gsap.to(titleElement, {
        duration: 0.6,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 0.45
      });

      gsap.to(descriptionElement, {
        duration: 0.6,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 0.6
      });

      gsap.to(overlayElement, {
        opacity: 1,
        duration: 0.3,
        delay: 0.9
      });
    }

    // Animate close button
    gsap.fromTo(closeButtonRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.9 }
    );

    return () => {
      document.body.classList.remove('zoom-mode');
    };
  }, [about]);

  const handleClose = () => {
    playSound('close');
    
    const overlayElement = titleOverlayRef.current;
    const categoryElement = overlayElement.querySelector('.image-slide-number span');
    const titleElement = overlayElement.querySelector('.image-slide-title h1');
    const descriptionElement = overlayElement.querySelector('.description-line');

    // Hide title overlay
    gsap.to(overlayElement, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    });

    gsap.to(categoryElement, {
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
      ease: 'power2.out',
      onComplete: () => {
        navigate('/');
      }
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!about) return null;

  return (
    <>
      <div 
        className="split-screen-container active" 
        ref={splitContainerRef}
        style={{ opacity: 0 }}
      >
        <div className="split-left" onClick={handleOverlayClick}>
          <div className="zoom-target" id="zoomTarget">
            {about.imageUrl && (
              <img 
                src={about.imageUrl} 
                alt={about.title || 'About'} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            )}
          </div>
        </div>
        <div className="split-right">
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            color: 'white'
          }}>
            {about.bioTitle && (
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '500',
                marginBottom: '2rem',
                letterSpacing: '-0.02em'
              }}>
                {about.bioTitle}
              </h2>
            )}
            {about.bio && (
              <p style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                fontWeight: '300',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {about.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="image-title-overlay" ref={titleOverlayRef} style={{ opacity: 0 }}>
        <div className="image-slide-number">
          <span>ABOUT</span>
        </div>
        <div className="image-slide-title">
          <h1>{about.title || 'Mihai Darvasa'}</h1>
        </div>
        <div className="image-slide-description">
          <span className="description-line">Artist & Muralist</span>
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

export default About;
