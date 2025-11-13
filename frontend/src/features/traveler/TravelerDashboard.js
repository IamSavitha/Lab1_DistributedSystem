import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProperties, setSearchFilters } from '../../features/property/propertySlice';
import { addFavorite, removeFavorite } from '../../features/booking/bookingSlice';

function TravelerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { properties, searchFilters, loading, error } = useSelector((state) => state.property);
  const { favorites } = useSelector((state) => state.booking);
  const travelerInfo = useSelector((state) => state.traveler.travelerInfo);

  // Local state for form inputs
  const [filters, setFilters] = useState({
    location: searchFilters.location || '',
    checkIn: searchFilters.checkIn || '',
    checkOut: searchFilters.checkOut || '',
    guests: searchFilters.guests || 1,
    minPrice: searchFilters.minPrice || 0,
    maxPrice: searchFilters.maxPrice || 10000,
  });

  // Fetch properties on component mount
  useEffect(() => {
    dispatch(fetchProperties(searchFilters));
  }, [dispatch]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchFilters(filters));
    dispatch(fetchProperties(filters));
  };

  // Handle view details
  const handleViewDetails = (propertyId) => {
    navigate(`/traveler/property/${propertyId}`);
  };

  // Check if property is in favorites
  const isFavorited = (propertyId) => {
    return favorites.some(fav => fav.propertyId === propertyId || fav._id === propertyId);
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (propertyId) => {
    if (isFavorited(propertyId)) {
      dispatch(removeFavorite(propertyId));
    } else {
      dispatch(addFavorite(propertyId));
    }
  };

  return (
    <div className="container mt-4">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <h2>Welcome, {travelerInfo?.name || 'Traveler'}!</h2>
          <p className="text-muted">Find your perfect stay</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Search Properties</h5>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City or address"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Check-in</label>
                <input
                  type="date"
                  className="form-control"
                  name="checkIn"
                  value={filters.checkIn}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Check-out</label>
                <input
                  type="date"
                  className="form-control"
                  name="checkOut"
                  value={filters.checkOut}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Guests</label>
                <input
                  type="number"
                  className="form-control"
                  name="guests"
                  value={filters.guests}
                  onChange={handleFilterChange}
                  min="1"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Price Range</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                  />
                  <span className="input-group-text">-</span>
                  <input
                    type="number"
                    className="form-control"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Properties List */}
      <div className="row">
        <div className="col-12">
          <h4 className="mb-3">Available Properties ({properties.length})</h4>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="alert alert-info">
          No properties found. Try adjusting your search filters.
        </div>
      ) : (
        <div className="row g-4">
          {properties.map((property) => (
            <div key={property._id} className="col-md-4">
              <div className="card h-100 shadow-sm">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    className="card-img-top"
                    alt={property.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                    style={{ height: '200px' }}
                  >
                    <span className="text-white">No Image</span>
                  </div>
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{property.title}</h5>
                    <button
                      className="btn btn-link p-0"
                      onClick={() => handleToggleFavorite(property._id)}
                    >
                      <i
                        className={`bi ${
                          isFavorited(property._id) ? 'bi-heart-fill text-danger' : 'bi-heart'
                        }`}
                        style={{ fontSize: '1.5rem' }}
                      ></i>
                    </button>
                  </div>
                  <p className="card-text text-muted small">
                    <i className="bi bi-geo-alt"></i> {property.location}
                  </p>
                  <p className="card-text">{property.description?.substring(0, 100)}...</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-primary fw-bold">${property.pricePerNight}/night</span>
                    <span className="text-muted small">
                      <i className="bi bi-people"></i> {property.guests} guests
                    </span>
                  </div>
                  <button
                    className="btn btn-primary w-100 mt-3"
                    onClick={() => handleViewDetails(property._id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TravelerDashboard;
