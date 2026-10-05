import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const CATEGORY_LINKS = [
  { to: '/', label: 'All Work' },
  { to: '/interior', label: 'Interior Murals' },
  { to: '/exterior', label: 'Exterior Murals' },
  { to: '/canvas', label: 'Canvas' }
];

// Each Bio entry opens the About panel
const BIO_ITEMS = ['Artist', 'Plant Lover', 'Explorer', 'Dad'];

// Set PLANT_SHOP_URL to show the Plant Shop link
const PLANT_SHOP_URL = null;
const SOCIAL_LINKS = [
  { href: 'https://instagram.com/mihaidarvasa', label: 'Instagram' },
  { href: 'https://facebook.com/mihaidarvasa', label: 'Facebook' },
  ...(PLANT_SHOP_URL ? [{ href: PLANT_SHOP_URL, label: 'Plant Shop' }] : [])
];

function NavLinks({ onNavClick }) {
  return (
    <>
      <h3>/Menu</h3>
      <ul>
        {CATEGORY_LINKS.map(({ to, label }) => (
          <li key={to}><Link to={to} onClick={onNavClick}>{label}</Link></li>
        ))}
      </ul>
    </>
  );
}

function BioLinks({ onAboutClick }) {
  return (
    <>
      <h3>/Bio</h3>
      <ul>
        {BIO_ITEMS.map((label) => (
          <li key={label}><a href="#about" onClick={onAboutClick}>{label}</a></li>
        ))}
      </ul>
    </>
  );
}

function ConnectLinks() {
  return (
    <>
      <h3>/Connect</h3>
      <ul>
        {SOCIAL_LINKS.map(({ href, label }) => (
          <li key={label}><a href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>
        ))}
      </ul>
    </>
  );
}

function Header({ onAboutClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const navValuesRef = useRef(null);
  const navBioRef = useRef(null);
  const navConnectRef = useRef(null);
  const hamburgerRef = useRef(null);
  const hamburgerLinesRef = useRef([]);

  useEffect(() => {
    // Fade in animations for header elements
    gsap.set([logoRef.current, navValuesRef.current, navBioRef.current, navConnectRef.current], {
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

    gsap.to([navValuesRef.current, navBioRef.current, navConnectRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      delay: 0.4
    });
  }, []);

  // Animate hamburger to X
  useEffect(() => {
    if (!hamburgerRef.current) return;
    
    const lines = hamburgerLinesRef.current;
    if (lines.length !== 3) return;

    if (menuOpen) {
      // Animate to X
      gsap.to(lines[0], {
        rotation: 45,
        y: 5,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(lines[1], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      });
      gsap.to(lines[2], {
        rotation: -45,
        y: -5,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      // Animate back to hamburger
      gsap.to(lines[0], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(lines[1], {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
        delay: 0.1
      });
      gsap.to(lines[2], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleNavClick = () => {
    closeMenu();
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (onAboutClick) {
      onAboutClick();
    }
  };

  return (
    <div className="header">
      {/* Logo */}
      <div className="nav-section" ref={logoRef}>
        <Link to="/" className="logo-container" onClick={handleNavClick}>
          <div className="logo-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
          </div>
          <span className="logo-text">Mihai Darvasa</span>
        </Link>
      </div>

      {/* Hamburger - direct child of header for proper z-index stacking */}
      <button 
        ref={hamburgerRef}
        className="hamburger" 
        onClick={toggleMenu} 
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span ref={(el) => { if (el) hamburgerLinesRef.current[0] = el; }}></span>
        <span ref={(el) => { if (el) hamburgerLinesRef.current[1] = el; }}></span>
        <span ref={(el) => { if (el) hamburgerLinesRef.current[2] = el; }}></span>
      </button>

      {/* Desktop Navigation */}
      <div className="desktop-nav-values" ref={navValuesRef}>
        <NavLinks onNavClick={handleNavClick} />
      </div>
      <div className="desktop-nav-bio" ref={navBioRef}>
        <BioLinks onAboutClick={handleAboutClick} />
      </div>
      <div className="desktop-nav-connect" ref={navConnectRef}>
        <ConnectLinks />
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-values">
          <NavLinks onNavClick={handleNavClick} />
        </div>
        <div className="mobile-menu-bio">
          <BioLinks onAboutClick={handleAboutClick} />
        </div>
        <div className="mobile-menu-connect">
          <ConnectLinks />
        </div>
      </div>
    </div>
  );
}

export default Header;
