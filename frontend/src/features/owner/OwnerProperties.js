import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function OwnerProperties() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/owner/properties');
        setProperties(res.data);
      } catch (err) {
        alert('Failed to load properties.');
      }
    };
    fetchProperties();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">My Properties</h2>

      <div className="text-end mb-4">
        <Link to="/owner/properties/new" className="btn btn-success">
          + Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-center text-muted">You haven’t listed any properties yet.</p>
      ) : (
        <div className="row">
          {properties.map((property) => (
            <div className="col-md-4 mb-4" key={property.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={property.imageUrl}
                  className="card-img-top"
                  alt={property.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{property.name}</h5>
                  <p className="card-text">{property.location}</p>
                  <p className="card-text text-muted">${property.price} / night</p>
                  <Link
                    to={`/owner/properties/${property.id}/edit`}
                    className="btn btn-outline-primary w-100"
                  >
                    Edit Property
                  </Link>
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