import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function TravelerFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Fetch favorite properties on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      // Changed endpoint to /favorites instead of /traveler/favorites
      const res = await api.get('/favorites');
      console.log('Favorites response:', res.data);
      
      // Parse based on backend response structure
      const favoritesList = res.data.favorites || res.data;
      setFavorites(Array.isArray(favoritesList) ? favoritesList : []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      alert('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  // Handle remove from favorites
  const handleRemoveFavorite = async (propertyId) => {
    if (!window.confirm('Are you sure you want to remove this property from favorites?')) {
      return;
    }

    setRemovingId(propertyId);
    try {
      await api.delete(`/favorites/${propertyId}`);
      // Remove from local state immediately for better UX
      setFavorites(favorites.filter(property => property.id !== propertyId));
      alert('Removed from favorites!');
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      alert('Failed to remove from favorites. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <main className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your favorites...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">My Favorite Properties</h2>

      {favorites.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">You haven't added any favorites yet.</p>
          <Link to="/traveler/dashboard" className="btn btn-primary">
            Explore Properties
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            You have {favorites.length} favorite {favorites.length === 1 ? 'property' : 'properties'}
          </p>
          <div className="row">
            {favorites.map((property) => (
              <div className="col-md-4 mb-4" key={property.id}>
                <div className="card h-100 shadow-sm position-relative">
                  {/* Remove Favorite Button (Heart Icon) */}
                  <button
                    className="btn btn-danger position-absolute top-0 end-0 m-2"
                    style={{ zIndex: 10, borderRadius: '50%', width: '40px', height: '40px' }}
                    onClick={() => handleRemoveFavorite(property.id)}
                    disabled={removingId === property.id}
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    {removingId === property.id ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <span style={{ fontSize: '20px' }}>♥</span>
                    )}
                  </button>

                  <img
                    src={property.imageUrl || property.image_url || 'https://via.placeholder.com/300x200?text=Property+Image'}
                    className="card-img-top"
                    alt={`Image of ${property.name || property.title}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{property.name || property.title}</h5>
                    <p className="card-text">
                      <i className="bi bi-geo-alt"></i> {property.location || property.city}
                    </p>
                    {property.type && (
                      <p className="card-text text-muted">
                        {property.type} · {property.bedrooms} BR · {property.bathrooms} BA
                      </p>
                    )}
                    <p className="card-text fw-bold text-primary">
                      ${property.price || property.price_per_night} / night
                    </p>
                    
                    {/* View Details Button */}
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
      )}
    </main>
  );
}

export default TravelerFavorites;
