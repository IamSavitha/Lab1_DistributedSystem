import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function TravelerHistory() {
  const [history, setHistory] = useState([]);

  // Fetch past bookings on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/traveler/history');
        setHistory(res.data);
      } catch (err) {
        alert('Failed to load booking history.');
      }
    };
    fetchHistory();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Past Stays</h2>

      {history.length === 0 ? (
        <p className="text-center text-muted">You haven’t completed any stays yet.</p>
      ) : (
        <div className="row">
          {history.map((booking) => (
            <div className="col-md-6 mb-4" key={booking.id}>
              <div className="card shadow-sm">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src={booking.property.imageUrl}
                      alt={`Image of ${booking.property.name}`}
                      className="img-fluid rounded-start"
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">{booking.property.name}</h5>
                      <p className="card-text">
                        {booking.property.location}<br />
                        {booking.startDate} to {booking.endDate}
                      </p>
                      <p className="card-text">
                        Guests: {booking.guests}
                      </p>
                      <p className="card-text text-muted">
                        Total Paid: ${booking.totalPrice}
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