import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function OwnerAnalytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    topProperty: null,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/owner/analytics');
        setStats(res.data);
      } catch (err) {
        alert('Failed to load analytics.');
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Analytics Overview</h2>

      <div className="row text-center mb-4">
        <div className="col-md-4">
          <div className="border p-3 rounded">
            <h5>Total Revenue</h5>
            <p className="fs-4 text-success">${stats.totalRevenue}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="border p-3 rounded">
            <h5>Total Bookings</h5>
            <p className="fs-4">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="border p-3 rounded">
            <h5>Top Property</h5>
            <p className="fs-5">{stats.topProperty?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="text-center text-muted">
        <p>Monthly revenue chart coming soon...</p>
      </div>
    </main>
  );
}

export default OwnerAnalytics;