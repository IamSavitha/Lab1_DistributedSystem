import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AgentButton from '../../components/AgentButton';

function TravelerDashboard() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Handle property search
  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('🔍 Search button clicked!');
    console.log('Search params:', { location, startDate, endDate, guests });
    
    setLoading(true);
    setSearched(true);
    try {
      console.log('Sending request to /properties/search...');
      const res = await api.get('/properties/search', {
        params: { location, startDate, endDate, guests },
      });
      console.log('✅ Search results received:', res.data);
      
      // Backend returns { properties: [...] } or just [...]
      const propertyList = res.data.properties || res.data;
      console.log('Setting results:', propertyList);
      setResults(propertyList);
    } catch (err) {
      console.error('❌ Search failed:', err);
      console.error('Error response:', err.response?.data);
      alert('Search failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Find Your Stay</h2>

      {/* Search Form */}
      <form className="row g-3 mb-4" onSubmit={handleSearch} aria-label="Property search form">
        <div className="col-md-4">
          <label htmlFor="location" className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            id="location"
            placeholder="e.g. New York"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="startDate" className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="endDate" className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="guests" className="form-label">Guests</label>
          <input
            type="number"
            className="form-control"
            id="guests"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </div>
        <div className="col-12 text-end">
          <button type="submit" className="btn btn-dark" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Search Results */}
      <section>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Searching for properties...</p>
          </div>
        ) : searched && results.length > 0 ? (
          <>
            <h4 className="mb-3">Found {results.length} {results.length === 1 ? 'property' : 'properties'}</h4>
            <div className="row">
              {results.map((property) => (
                <div className="col-md-4 mb-4" key={property.id}>
                  <div className="card h-100 shadow-sm">
                    <img
                      src={property.imageUrl || property.image_url || 'https://via.placeholder.com/300x200?text=Property+Image'}
                      className="card-img-top"
                      alt={`Image of ${property.name || property.title}`}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{property.name || property.title}</h5>
                      <p className="card-text text-muted">
                        <i className="bi bi-geo-alt"></i> {property.location || property.city}
                      </p>
                      <p className="card-text">
                        {property.type} · {property.bedrooms} BR · {property.bathrooms} BA
                      </p>
                      <p className="card-text">
                        <span className="text-muted">Max Guests: {property.max_guests || property.maxGuests}</span>
                      </p>
                      <p className="card-text fw-bold text-primary">
                        ${property.price_per_night || property.price} / night
                      </p>
                      
                      {/* Navigation to Property Details */}
                      <Link 
                        to={`/property/${property.id}`} 
                        className="btn btn-outline-primary w-100 mt-auto"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-5">
            <div className="alert alert-info" role="alert">
              <h5>No properties found</h5>
              <p className="mb-0">Try adjusting your search filters or location.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="card border-0">
              <div className="card-body">
                <i className="bi bi-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="text-muted mt-3">Start your search to find amazing properties!</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* AI Agent Button */}
      <AgentButton />
    </main>
  );
}

export default TravelerDashboard;
