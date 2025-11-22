import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites, removeFavorite } from '../../features/booking/bookingSlice';

function TravelerFavorites() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { favorites, loading, error } = useSelector((state) => state.booking);

  // Fetch favorites on component mount
  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  // Handle view details
  const handleViewDetails = (propertyId) => {
    navigate(`/traveler/property/${propertyId}`);
  };

  // Handle remove favorite
  const handleRemoveFavorite = (propertyId) => {
    if (window.confirm('Remove this property from your favorites?')) {
      dispatch(removeFavorite(propertyId));
    }
  };

  // Get image URL from property
  const getImageUrl = (property) => {
    // Try multiple possible field names
    return property.imageUrl || 
           property.image_url || 
           (property.images && property.images.length > 0 ? property.images[0] : null) ||
           'https://via.placeholder.com/400x200?text=No+Image';
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2>My Favorites</h2>
          <p className="text-muted">Properties you've saved for later</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-heart" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          </div>
          <h4>No favorites yet</h4>
          <p className="text-muted">
            Start adding properties to your favorites by clicking the heart icon!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/traveler/dashboard')}>
            Browse Properties
          </button>
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-12">
              <p className="text-muted">You have {favorites.length} favorite properties</p>
            </div>
          </div>
          <div className="row g-4">
            {favorites.map((favorite) => {
              const property = favorite.property || favorite;
              const imageUrl = getImageUrl(property);
              const propertyName = property.name || property.title;
              const propertyLocation = property.location || property.city;
              const propertyPrice = property.price || property.pricePerNight || property.price_per_night;
              const propertyGuests = property.maxGuests || property.max_guests || property.guests;
              
              return (
                <div key={favorite.id || property.id} className="col-md-4">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={imageUrl}
                      className="card-img-top"
                      alt={propertyName}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{propertyName}</h5>
                        <button
                          className="btn btn-link p-0 text-danger"
                          onClick={() => handleRemoveFavorite(favorite.propertyId || property.id)}
                          title="Remove from favorites"
                        >
                          <i className="bi bi-heart-fill" style={{ fontSize: '1.5rem' }}></i>
                        </button>
                      </div>
                      <p className="card-text text-muted small mb-2">
                        <i className="bi bi-geo-alt"></i> {propertyLocation}
                      </p>
                      <p className="card-text">
                        {property.description?.substring(0, 100)}
                        {property.description?.length > 100 ? '...' : ''}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-primary fw-bold">
                          ${propertyPrice}/night
                        </span>
                        <span className="text-muted small">
                          <i className="bi bi-people"></i> {propertyGuests} guests
                        </span>
                      </div>
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleViewDetails(favorite.propertyId || property.id)}
                      >
                        View Details
                      </button>
                    </div>
                    {(favorite.favoritedAt || favorite.favorited_at || favorite.addedAt) && (
                      <div className="card-footer bg-light">
                        <small className="text-muted">
                          Added on {new Date(favorite.favoritedAt || favorite.favorited_at || favorite.addedAt).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default TravelerFavorites;
