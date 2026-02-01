import { Link } from 'react-router-dom';

function Header({ currentCategory }) {
  return (
    <div className="header">
      <div className="nav-section">
        <Link to="/" className="logo-container">
          <div className="logo-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
          </div>
        </Link>
      </div>
      <div className="values-section">
        <h3>+Menu</h3>
        <ul>
          <li><Link to="/">All Work</Link></li>
          <li><Link to="/interior">Interior Murals</Link></li>
          <li><Link to="/exterior">Exterior Murals</Link></li>
          <li><Link to="/canvas">Canvas</Link></li>
        </ul>
      </div>
      <div className="location-section">
        <h3>+Studio</h3>
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
