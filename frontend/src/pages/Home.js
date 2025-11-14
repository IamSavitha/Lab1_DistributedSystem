import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthClick = (type, mode) => {
    if (type === 'traveler') {
      navigate(mode === 'login' ? '/traveler/login' : '/traveler/signup');
    } else {
      navigate(mode === 'login' ? '/owner/login' : '/owner/signup');
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <svg width="102" height="32" fill="#FF385C" style={{ display: 'block' }}>
              <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1.03-.76 1.5l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.33A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95zm12.74 1.48a4.76 4.76 0 01-2.9 3.75c-.76.32-1.6.41-2.42.32-.8-.1-1.6-.36-2.42-.84a15.64 15.64 0 01-3.63-3.1c2.1-2.6 3.37-4.97 3.85-7.08.23-1 .26-1.9.16-2.73a5.53 5.53 0 00-.86-2.2 5.36 5.36 0 00-4.49-2.28c-1.85 0-3.5.86-4.5 2.27a5.18 5.18 0 00-.85 2.21c-.13.84-.1 1.77.16 2.73.48 2.11 1.78 4.51 3.85 7.1a14.33 14.33 0 01-3.63 3.12c-.83.48-1.62.73-2.42.83a4.76 4.76 0 01-5.32-4.07c-.1-.8-.03-1.6.29-2.5.1-.32.25-.64.41-1.02.22-.52.48-1.06.73-1.6l.04-.07c2.16-4.77 4.52-9.64 6.97-14.41l.1-.2c.25-.48.5-.99.76-1.47.26-.51.54-1 .9-1.4a3.32 3.32 0 015.09 0c.35.4.64.89.9 1.4.25.48.5 1 .76 1.47l.1.2c2.44 4.77 4.8 9.64 7 14.41l.03.03c.26.52.48 1.1.73 1.6.16.39.32.7.42 1.03.19.9.29 1.7.19 2.5z"></path>
            </svg>
            <span className="logo-text">airbnb</span>
          </div>

          <nav className="header-nav">
            <button className="nav-link">Places to stay</button>
            <button className="nav-link">Experiences</button>
            <button className="nav-link">Online Experiences</button>
          </nav>

          <div className="header-actions" >
            <button className="host-btn" onClick={() => handleAuthClick('owner', 'login')}>
              Airbnb your home
            </button>
            <button className="menu-btn" onClick={() => setShowAuthModal(true)}>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: 3, overflow: 'visible' }}>
                <g fill="none"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g>
              </svg>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}>
                <path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Not sure where to go? Perfect.</h1>
          <button className="hero-btn" onClick={() => navigate('/traveler/dashboard')}>
            I'm flexible
          </button>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-tabs">
            <button className="search-tab active">Places to stay</button>
            <button className="search-tab">Experiences</button>
          </div>
          
          <div className="search-bar">
            <div className="search-field">
              <label>Location</label>
              <input type="text" placeholder="Where are you going?" />
            </div>
            <div className="search-field">
              <label>Check in</label>
              <input type="text" placeholder="Add dates" />
            </div>
            <div className="search-field">
              <label>Check out</label>
              <input type="text" placeholder="Add dates" />
            </div>
            <div className="search-field">
              <label>Guests</label>
              <input type="text" placeholder="Add guests" />
            </div>
            <button className="search-btn" onClick={() => navigate('/traveler/dashboard')}>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: 4, overflow: 'visible' }}>
                <g fill="none"><path d="m13 24c6.0751 0 11-4.9249 11-11 0-6.0751-4.9249-11-11-11-6.0751 0-11 4.9249-11 11 0 6.0751 4.9249 11 11 11zm8-3 9 9"></path></g>
              </svg>
              <span>Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="categories-container">
          <h2>Inspiration for your next trip</h2>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigate('/traveler/dashboard')}>
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" alt="Luxury homes" />
              <h3>Amazing views</h3>
            </div>
            <div className="category-card" onClick={() => navigate('/traveler/dashboard')}>
              <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400" alt="Beach" />
              <h3>Beachfront</h3>
            </div>
            <div className="category-card" onClick={() => navigate('/traveler/dashboard')}>
              <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400" alt="Countryside" />
              <h3>Countryside</h3>
            </div>
            <div className="category-card" onClick={() => navigate('/traveler/dashboard')}>
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" alt="City" />
              <h3>Iconic cities</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Host Section */}
      <section className="host-section">
        <div className="host-content">
          <div className="host-text">
            <h2>Try hosting</h2>
            <p>Earn extra income and unlock new opportunities by sharing your space.</p>
            <button className="btn-primary" onClick={() => handleAuthClick('owner', 'signup')}>
              Learn more
            </button>
          </div>
          <div className="host-image">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600" alt="Become a host" />
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>
              ×
            </button>
            <h2 className="modal-title">Welcome to Airbnb</h2>
            
            <div className="auth-options">
              <div className="auth-section traveler-section">
                <div className="section-badge traveler-badge">TRAVELER</div>
                <h3>Find Your Perfect Stay</h3>
                <p>Search and book unique places around the world</p>
                <div className="auth-buttons">
                  <button 
                    className="btn-auth primary"
                    onClick={() => handleAuthClick('traveler', 'login')}
                  >
                    Log in
                  </button>
                  <button 
                    className="btn-auth secondary"
                    onClick={() => handleAuthClick('traveler', 'signup')}
                  >
                    Sign up
                  </button>
                </div>
              </div>

              <div className="divider">OR</div>

              <div className="auth-section owner-section">
                <div className="section-badge owner-badge">HOST / OWNER</div>
                <h3>Earn Money Hosting</h3>
                <p>List your property and welcome travelers</p>
                <div className="auth-buttons">
                  <button 
                    className="btn-auth primary"
                    onClick={() => handleAuthClick('owner', 'login')}
                  >
                    Log in
                  </button>
                  <button 
                    className="btn-auth secondary"
                    onClick={() => handleAuthClick('owner', 'signup')}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><button onClick={() => navigate('/traveler/dashboard')}>Help Center</button></li>
              <li><button onClick={() => navigate('/traveler/dashboard')}>Safety information</button></li>
              <li><button onClick={() => navigate('/traveler/dashboard')}>Cancellation options</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><button onClick={() => navigate('/traveler/dashboard')}>Airbnb.org: disaster relief housing</button></li>
              <li><button onClick={() => navigate('/traveler/dashboard')}>Support: Afghan refugees</button></li>
              <li><button onClick={() => navigate('/traveler/dashboard')}>Celebrating diversity & belonging</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Hosting</h4>
            <ul>
              <li><button onClick={() => handleAuthClick('owner', 'signup')}>Try hosting</button></li>
              <li><button onClick={() => navigate('/owner/dashboard')}>Explore hosting resources</button></li>
              <li><button onClick={() => navigate('/owner/dashboard')}>Visit our community forum</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <ul>
              <li><button onClick={() => navigate('/')}>Newsroom</button></li>
              <li><button onClick={() => navigate('/')}>Learn about new features</button></li>
              <li><button onClick={() => navigate('/')}>Careers</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Airbnb Clone, Inc. · Privacy · Terms · Sitemap</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;