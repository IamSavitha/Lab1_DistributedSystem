import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function OwnerDashboard() {
  const [ownerInfo, setOwnerInfo] = useState(null);

  useEffect(() => {
    const fetchOwnerInfo = async () => {
      try {
        const res = await api.get('/owner/profile');
        setOwnerInfo(res.data);
      } catch (err) {
        alert('Failed to load owner info.');
      }
    };
    fetchOwnerInfo();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Owner Dashboard</h2>

      {ownerInfo ? (
        <div className="text-center mb-4">
          <h4>Welcome, {ownerInfo.name}</h4>
          <p>{ownerInfo.email}</p>
        </div>
      ) : (
        <p className="text-center text-muted">Loading owner info...</p>
      )}

      <div className="row text-center">
        <div className="col-md-4 mb-3">
          <Link to="/owner/properties" className="btn btn-outline-primary w-100">
            Manage Properties
          </Link>
        </div>
        <div className="col-md-4 mb-3">
          <Link to="/owner/bookings" className="btn btn-outline-success w-100">
            View Bookings
          </Link>
        </div>
        <div className="col-md-4 mb-3">
          <Link to="/owner/profile" className="btn btn-outline-secondary w-100">
            Edit Profile
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OwnerDashboard;