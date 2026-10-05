import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { gsap, smoothEase } from '../../utils/gsap';
import { animateTitleIn, animateTitleOut, CloseIcon } from './detailAnimations';

function AboutDetail({ onClose }) {
  // undefined while loading, null if the About page hasn't been set up yet
  const about = useQuery(api.about.getAbout);
  const isLoading = about === undefined;
  const splitContainerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const imageTitleOverlayRef = useRef(null);
  const closingRef = useRef(false);

  // Opening animation, once the content has loaded
  useEffect(() => {
    if (isLoading) return;

    gsap.to(splitContainerRef.current, { opacity: 1, duration: 1.2, ease: smoothEase });
    animateTitleIn(imageTitleOverlayRef.current, 0.1);
    gsap.fromTo(closeButtonRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.9 }
    );
  }, [isLoading]);

  const handleClose = () => {
    if (closingRef.current || !splitContainerRef.current) return;
    closingRef.current = true;

    animateTitleOut(imageTitleOverlayRef.current);
    gsap.to(closeButtonRef.current, { duration: 0.3, opacity: 0, x: 40, ease: 'power2.in' });
    gsap.to(splitContainerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: onClose
    });
  };

  // Close with Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (isLoading) return null;
  const content = about || {};

  return (
    <>
      <div
        className="split-screen-container active"
        ref={splitContainerRef}
        style={{ opacity: 0 }}
      >
        <div className="split-left" onClick={handleOverlayClick}>
          <div className="zoom-target" id="zoomTarget">
            {content.imageUrl && (
              <img
                src={content.imageUrl}
                alt={content.title || 'About'}
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
        <div className="split-right" onClick={handleOverlayClick}>
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            color: 'white'
          }}>
            {content.bioTitle && (
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '500',
                marginBottom: '2rem',
                letterSpacing: '-0.02em'
              }}>
                {content.bioTitle}
              </h2>
            )}
            {content.bio && (
              <p style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                fontWeight: '300',
                color: 'rgba(255, 255, 255, 0.9)',
                whiteSpace: 'pre-wrap'
              }}>
                {content.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="image-title-overlay" ref={imageTitleOverlayRef} style={{ opacity: 0 }}>
        <div className="image-slide-number">
          <span>ABOUT</span>
        </div>
        <div className="image-slide-title">
          <h1>{content.title || 'Mihai Darvasa'}</h1>
        </div>
        <div className="image-slide-description">
          <span className="description-line">Artist & Muralist</span>
        </div>
      </div>

      <button
        className="close-button active"
        ref={closeButtonRef}
        onClick={handleClose}
        aria-label="Close about"
        style={{ opacity: 0 }}
      >
        <CloseIcon />
      </button>
    </>
  );
}

export default AboutDetail;
