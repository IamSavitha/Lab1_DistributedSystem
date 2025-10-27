import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function TravelerHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch past bookings on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching history from /bookings/traveler/history...');
      const res = await api.get('/bookings/traveler/history');
      console.log('History response:', res.data);
      
      const historyList = res.data.history || res.data;
      setHistory(Array.isArray(historyList) ? historyList : []);
    } catch (err) {
      console.error('Failed to load booking history:', err);
      setError(err.response?.data?.error || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your history...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Unable to Load History</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchHistory}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Past Stays</h2>

      {history.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">You haven't completed any stays yet.</p>
        </div>
      ) : (
        <div className="row">
          {history.map((booking) => (
            <div className="col-md-6 mb-4" key={booking.id}>
              <div className="card shadow-sm">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src={booking.property?.imageUrl || booking.property?.image_url || 'https://placehold.co/200x200/e0e0e0/666666?text=Property'}
                      alt={`Image of ${booking.property?.name || 'Property'}`}
                      className="img-fluid rounded-start h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3Ctext fill="%23666666" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">{booking.property?.name || booking.property_name || 'Property'}</h5>
                      <p className="card-text">
                        {booking.property?.location || booking.location}<br />
                        {booking.startDate || booking.start_date} to {booking.endDate || booking.end_date}
                      </p>
                      <p className="card-text">
                        Guests: {booking.guests}
                      </p>
                      <p className="card-text text-muted">
                        Total Paid: ${booking.totalPrice || booking.total_price}
                      </p>
                      <span className="badge bg-secondary">Completed</span>
                    </div>
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

export default TravelerHistory;
