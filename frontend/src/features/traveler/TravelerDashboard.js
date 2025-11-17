import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import './TravelerDashboard.css';

function TravelerDashboard() {
  // Search filters
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);

  // Search results
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setSearched(false);
  }, []);

  // Handle property search
  const handleSearch = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSearched(true);

    try {
      const res = await api.get('/properties/search', {
        params: { location, startDate, endDate, guests },
      });

      const propertyList = res.data.properties || res.data;
      setResults(propertyList);
    } catch (err) {
      console.error('Search failed:', err);
      alert('Search failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="traveler-dashboard">
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header fade-in">
          <h1 className="dashboard-title">Find Your Perfect Stay</h1>
          <p className="dashboard-subtitle">
            Discover amazing places to stay around the world
          </p>
        </div>

        {/* Enhanced Search Form */}
        <div className="search-card slide-up">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label className="form-label">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M16 2a12 12 0 1 0 12 12A12 12 0 0 0 16 2zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10z"/>
                  <path d="M16 7a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm0 12a5 5 0 1 1 5-5 5 5 0 0 1-5 5z"/>
                </svg>
                Location
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M26 4h-4V2h-2v2H12V2h-2v2H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z"/>
                </svg>
                Check-in
              </label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M26 4h-4V2h-2v2H12V2h-2v2H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z"/>
                </svg>
                Check-out
              </label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
                Guests
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="Number of guests"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="m13 24c6.0751 0 11-4.9249 11-11 0-6.0751-4.9249-11-11-11-6.0751 0-11 4.9249-11 11 0 6.0751 4.9249 11 11 11zm8-3 9 9"/>
              </svg>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Searching for your perfect stay...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && searched && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">
                {results.length > 0 ? 'Available Properties' : 'No Properties Found'}
              </h2>
              {results.length > 0 && (
                <span className="results-count">{results.length} properties</span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3 className="empty-state-title">No properties found</h3>
                <p className="empty-state-description">
                  We couldn't find any properties matching your search criteria.
                  Try adjusting your filters for better results.
                </p>
                <div className="empty-state-suggestions">
                  <h4>Suggestions:</h4>
                  <ul>
                    <li>Try different dates</li>
                    <li>Search in a nearby location</li>
                    <li>Adjust the number of guests</li>
                    <li>Check your spelling</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="results-grid">
                {results.map((property, index) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial Welcome State */}
        {!loading && !searched && (
          <div className="welcome-state">
            <div className="welcome-icon">
              <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1l-8 7v13h5v-8h6v8h5V8z"/>
              </svg>
            </div>
            <h2 className="welcome-title">Start Your Journey</h2>
            <p className="welcome-description">
              Enter your travel details above to discover amazing properties around the world.
              Your next adventure awaits!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TravelerDashboard;
