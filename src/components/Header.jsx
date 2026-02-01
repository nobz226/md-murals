import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

function Header({ currentCategory }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const navValuesRef = useRef(null);
  const navLocationRef = useRef(null);
  const navContactRef = useRef(null);
  const navSocialRef = useRef(null);

  useEffect(() => {
    // Fade in animations for header elements
    gsap.set([logoRef.current, navValuesRef.current, navLocationRef.current, navContactRef.current, navSocialRef.current], {
      opacity: 0,
      y: -20
    });

    gsap.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.2
    });

    gsap.to([navValuesRef.current, navLocationRef.current, navContactRef.current, navSocialRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      delay: 0.4
    });
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="header">
      {/* Logo and Hamburger */}
      <div className="nav-section" ref={logoRef}>
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <div className="logo-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
          </div>
          <span className="logo-text">Mihai Darvasa</span>
        </Link>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="desktop-nav-values" ref={navValuesRef}>
        <h3>+Menu</h3>
        <ul>
          <li><Link to="/">All Work</Link></li>
          <li><Link to="/interior">Interior Murals</Link></li>
          <li><Link to="/exterior">Exterior Murals</Link></li>
          <li><Link to="/canvas">Canvas</Link></li>
        </ul>
      </div>
      <div className="desktop-nav-location" ref={navLocationRef}>
        <h3>+Studio</h3>
        <p><Link to="/">About</Link></p>
        <p>Vancouver</p>
        <p>British Columbia</p>
      </div>
      <div className="desktop-nav-contact" ref={navContactRef}>
        <h3>+Connect</h3>
        <p><a href="mailto:info@mihaidarvasa.com">info@mihaidarvasa.com</a></p>
      </div>
      <div className="desktop-nav-social" ref={navSocialRef}>
        <h3>+Follow</h3>
        <ul>
          <li><a href="https://instagram.com/mihaidarvasa" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://facebook.com/mihaidarvasa" target="_blank" rel="noopener noreferrer">Facebook</a></li>
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-values">
          <h3>+Menu</h3>
          <ul>
            <li><Link to="/" onClick={closeMenu}>All Work</Link></li>
            <li><Link to="/interior" onClick={closeMenu}>Interior Murals</Link></li>
            <li><Link to="/exterior" onClick={closeMenu}>Exterior Murals</Link></li>
            <li><Link to="/canvas" onClick={closeMenu}>Canvas</Link></li>
          </ul>
        </div>
        <div className="mobile-menu-location">
          <h3>+Studio</h3>
          <li><Link to="/" onClick={closeMenu}>About</Link></li>
        </div>
        <div className="mobile-menu-contact">
          <h3>+Connect</h3>
          <p><a href="mailto:info@mihaidarvasa.com">info@mihaidarvasa.com</a></p>
        </div>
        <div className="mobile-menu-social">
          <h3>+Follow</h3>
          <ul>
            <li>
              <a href="https://instagram.com/mihaidarvasa" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://facebook.com/mihaidarvasa" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Header;
