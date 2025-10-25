import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function TravelerFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Fetch favorite properties on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get('/traveler/favorites');
        setFavorites(res.data);
      } catch (err) {
        alert('Failed to load favorites.');
      }
    };
    fetchFavorites();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">My Favorite Properties</h2>

      {favorites.length === 0 ? (
        <p className="text-center text-muted">You haven’t added any favorites yet.</p>
      ) : (
        <div className="row">
          {favorites.map((property) => (
            <div className="col-md-4 mb-4" key={property.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={property.imageUrl}
                  className="card-img-top"
                  alt={`Image of ${property.name}`}
                />
                <div className="card-body">
                  <h5 className="card-title">{property.name}</h5>
                  <p className="card-text">{property.location}</p>
                  <p className="card-text text-muted">${property.price} / night</p>
                  <button className="btn btn-outline-primary w-100">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default TravelerFavorites;