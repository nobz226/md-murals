import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import { CustomEase } from 'gsap/dist/CustomEase';
import Header from '../components/Header';
import Footer from '../components/Footer';

gsap.registerPlugin(Flip, CustomEase);

function About() {
  const navigate = useNavigate();
  const aboutData = useQuery(api.about.getAbout);
  const splitContainerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const imageTitleOverlayRef = useRef(null);
  const scalingOverlayRef = useRef(null);
  const bioTextRef = useRef(null);
  const customEaseRef = useRef(null);

  useEffect(() => {
    customEaseRef.current = CustomEase.create("smooth", ".87,0,.13,1");
  }, []);

  useEffect(() => {
    if (!aboutData || !aboutData.url) return;

    // Create scaling overlay from a placeholder source
    const createScalingOverlay = () => {
      const overlay = document.createElement('div');
      overlay.className = 'scaling-image-overlay';
      overlay.style.backgroundImage = `url(${aboutData.url})`;
      overlay.style.backgroundSize = 'cover';
      overlay.style.backgroundPosition = '50% 50%';
      const img = document.createElement('img');
      img.src = aboutData.url;
      img.alt = aboutData.title;
      overlay.appendChild(img);
      document.body.appendChild(overlay);
      
      // Start from center of screen
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      gsap.set(overlay, {
        left: vw / 2 - 160,
        top: vh / 2 - 160,
        width: 320,
        height: 320,
        opacity: 1
      });
      
      return overlay;
    };

    // Add zoom-mode class to body
    document.body.classList.add('zoom-mode');

    // Create and animate scaling overlay
    const scalingOverlay = createScalingOverlay();
    scalingOverlayRef.current = scalingOverlay;

    const splitContainer = splitContainerRef.current;
    const zoomTarget = splitContainer.querySelector('.zoom-target');

    // Animate split screen container
    gsap.to(splitContainer, {
      opacity: 1,
      duration: 1.2,
      ease: customEaseRef.current || 'power2.inOut'
    });

    // Flip animation from center to zoom target
    Flip.fit(scalingOverlay, zoomTarget, {
      duration: 1.2,
      ease: customEaseRef.current || 'power2.inOut',
      absolute: true,
      onComplete: () => {
        // After Flip completes, animate title overlay
        const overlayElement = imageTitleOverlayRef.current;
        const titleElement = overlayElement.querySelector('.image-slide-title h1');

        gsap.set(titleElement, { y: 60, opacity: 0 });

        gsap.to(titleElement, {
          duration: 0.6,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          delay: 0.1
        });

        gsap.to(overlayElement, {
          opacity: 1,
          duration: 0.3
        });

        // Animate bio text
        if (bioTextRef.current) {
          gsap.fromTo(bioTextRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
          );
        }
      }
    });

    // Animate close button
    gsap.fromTo(closeButtonRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.9 }
    );

    // Cleanup
    return () => {
      if (scalingOverlayRef.current) {
        scalingOverlayRef.current.remove();
      }
      document.body.classList.remove('zoom-mode');
    };
  }, [aboutData]);

  const handleClose = () => {
    if (!scalingOverlayRef.current) return;

    const overlayElement = imageTitleOverlayRef.current;
    const titleElement = overlayElement.querySelector('.image-slide-title h1');

    // Hide title overlay
    gsap.to(overlayElement, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    });

    gsap.to(titleElement, {
      duration: 0.4,
      y: -60,
      opacity: 0,
      ease: 'power2.out'
    });

    // Hide bio text
    if (bioTextRef.current) {
      gsap.to(bioTextRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

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

    // Reverse Flip animation back to center
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerTarget = document.createElement('div');
    centerTarget.style.position = 'fixed';
    centerTarget.style.left = `${vw / 2 - 160}px`;
    centerTarget.style.top = `${vh / 2 - 160}px`;
    centerTarget.style.width = '320px';
    centerTarget.style.height = '320px';
    document.body.appendChild(centerTarget);

    Flip.fit(scalingOverlayRef.current, centerTarget, {
      duration: 1.2,
      ease: customEaseRef.current || 'power2.inOut',
      absolute: true,
      onComplete: () => {
        // Remove overlay and temp target
        if (scalingOverlayRef.current) {
          scalingOverlayRef.current.remove();
          scalingOverlayRef.current = null;
        }
        centerTarget.remove();

        // Navigate back to home
        navigate('/');
      }
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!aboutData) {
    return (
      <>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
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
        <div className="split-right about-bio-container">
          <div className="about-bio-content" ref={bioTextRef}>
            <p>{aboutData.bio}</p>
          </div>
        </div>
      </div>

      <div className="image-title-overlay" ref={imageTitleOverlayRef} style={{ opacity: 0 }}>
        <div className="image-slide-title">
          <h1>{aboutData.title}</h1>
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
      <Footer />
    </>
  );
}

export default About;
