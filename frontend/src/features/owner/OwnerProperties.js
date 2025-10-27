import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function OwnerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/owner/properties');
      
      // Handle different response formats
      if (Array.isArray(res.data)) {
        setProperties(res.data);
      } else if (res.data.properties && Array.isArray(res.data.properties)) {
        setProperties(res.data.properties);
      } else if (res.data.data && Array.isArray(res.data.data)) {
        setProperties(res.data.data);
      } else {
        console.error('Invalid response format:', res.data);
        setProperties([]);
        setError('Invalid data format received from server.');
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
      setProperties([]);
      setError(err.response?.data?.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId, propertyName) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(propertyId);
    try {
      await api.delete(`/owner/properties/${propertyId}`);
      
      // Remove from local state
      setProperties(properties.filter(p => p.id !== propertyId));
      
      alert('Property deleted successfully!');
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert(err.response?.data?.error || 'Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your properties...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">My Properties</h2>

      <div className="text-end mb-4">
        <Link to="/owner/properties/new" className="btn btn-success">
          + Add New Property
        </Link>
      </div>

      {!Array.isArray(properties) || properties.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">You haven't listed any properties yet.</p>
          <Link to="/owner/properties/new" className="btn btn-primary">
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="row">
          {properties.map((property) => (
            <div className="col-md-4 mb-4" key={property.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={property.imageUrl || property.image_url || 'https://via.placeholder.com/300x200?text=Property'}
                  className="card-img-top"
                  alt={property.name || property.title}
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
                  <p className="card-text text-primary fw-bold">
                    ${property.price || property.price_per_night} / night
                  </p>
                  
                  <div className="mt-auto d-flex gap-2">
					  <Link
						to={`/owner/properties/${property.id}/edit`}
						className="btn btn-outline-primary"
						style={{ flex: 1 }}
					  >
						Edit
					  </Link>
					  <button
						className="btn btn-outline-danger"
						style={{ flex: 1 }}
						onClick={() => handleDelete(property.id, property.name || property.title)}
						disabled={deletingId === property.id}
					  >
						{deletingId === property.id ? 'Deleting...' : 'Delete'}
					  </button>
				  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default OwnerProperties;
