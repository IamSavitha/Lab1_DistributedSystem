import React, { useState } from 'react';
import api from '../../services/api';

function TravelerDashboard() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [results, setResults] = useState([]);

  // Handle property search
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get('/properties/search', {
        params: { location, startDate, endDate, guests },
      });
      setResults(res.data);
    } catch (err) {
      alert('Search failed. Please try again.');
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
          <button type="submit" className="btn btn-dark">Search</button>
        </div>
      </form>

      {/* Search Results */}
      <section>
        {results.length > 0 ? (
          <div className="row">
            {results.map((property) => (
              <div className="col-md-4 mb-4" key={property.id}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={property.imageUrl}
                    className="card-img-top"
                    alt={`Image of ${property.name}`}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{property.name}</h5>
                    <p className="card-text">
                      {property.type} · {property.bedrooms} BR · {property.bathrooms} BA
                    </p>
                    <p className="card-text text-muted">${property.price} / night</p>
                    <button className="btn btn-outline-primary w-100">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">No properties found. Try adjusting your filters.</p>
        )}
      </section>
    </main>
  );
}

export default TravelerDashboard;