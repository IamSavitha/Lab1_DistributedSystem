import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutTraveler } from '../features/traveler/travelerSlice';
import { logoutOwner } from '../features/owner/ownerSlice';
import api from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get login status from Redux
  const travelerInfo = useSelector((state) => state.traveler.travelerInfo);
  const ownerInfo = useSelector((state) => state.owner.ownerInfo);
  const isTravelerLoggedIn = useSelector((state) => state.traveler.isLoggedIn);
  const isOwnerLoggedIn = useSelector((state) => state.owner.isLoggedIn);

  // Determine current user type
  const userType = isTravelerLoggedIn ? 'traveler' : isOwnerLoggedIn ? 'owner' : null;

  // Handle logout
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      if (userType === 'traveler') {
        await api.post('/traveler/logout');
        dispatch(logoutTraveler());
        navigate('/traveler/login');
      } else if (userType === 'owner') {
        await api.post('/owner/logout');
        dispatch(logoutOwner());
        navigate('/owner/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      // Still logout on frontend even if API fails
      if (userType === 'traveler') {
        dispatch(logoutTraveler());
        navigate('/traveler/login');
      } else if (userType === 'owner') {
        dispatch(logoutOwner());
        navigate('/owner/login');
      }
    }
  };

  // Don't show navbar on login/signup pages
  const hideNavbarPaths = [
    '/traveler/login',
    '/traveler/signup',
    '/owner/login',
    '/owner/signup',
    '/'
  ];

  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to={userType === 'traveler' ? '/traveler/dashboard' : '/owner/dashboard'}>
          Airbnb Clone
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Traveler Navigation */}
          {isTravelerLoggedIn && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/traveler/dashboard">
                  Search
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/traveler/bookings">
                  My Bookings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/traveler/favorites">
                  Favorites
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/traveler/history">
                  History
                </Link>
              </li>
            </ul>
          )}

          {/* Owner Navigation */}
          {isOwnerLoggedIn && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/owner/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/owner/properties">
                  My Properties
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/owner/bookings">
                  Bookings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/owner/analytics">
                  Analytics
                </Link>
              </li>
            </ul>
          )}

          {/* User Info & Logout */}
          {(isTravelerLoggedIn || isOwnerLoggedIn) && (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {travelerInfo?.name || ownerInfo?.name || 'User'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to={userType === 'traveler' ? '/traveler/profile' : '/owner/profile'}
                    >
                      Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;