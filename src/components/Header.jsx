import { Link } from 'react-router-dom';
import { useState } from 'react';

function Header({ currentCategory }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="header">
      <div className="nav-section">
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <div className="logo-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
          </div>
        </Link>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div className={`values-section ${menuOpen ? 'menu-open' : ''}`}>
        <h3>+Menu</h3>
        <ul>
          <li><Link to="/" onClick={closeMenu}>All Work</Link></li>
          <li><Link to="/interior" onClick={closeMenu}>Interior Murals</Link></li>
          <li><Link to="/exterior" onClick={closeMenu}>Exterior Murals</Link></li>
          <li><Link to="/canvas" onClick={closeMenu}>Canvas</Link></li>
        </ul>
        
      </div>
      <div className="location-section">
        <h3>+Studio</h3>
          <li><Link to="/">About</Link></li>
        <p>Vancouver</p>
        <p>British Columbia</p>
      </div>
      <div className="contact-section">
        <h3>+Connect</h3>
        <p><a href="mailto:info@mihaidarvasa.com">info@mihaidarvasa.com</a></p>
      </div>
      <div className="social-section">
        <h3>+Follow</h3>
        <ul>
          <li><a href="https://instagram.com/mihaidarvasa" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://facebook.com/mihaidarvasa" target="_blank" rel="noopener noreferrer">Facebook</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Header;
