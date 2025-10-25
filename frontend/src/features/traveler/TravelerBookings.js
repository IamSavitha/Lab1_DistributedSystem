import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function TravelerBookings() {
  const [bookings, setBookings] = useState([]);

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/traveler/bookings');
        setBookings(res.data);
      } catch (err) {
        alert('Failed to load bookings.');
      }
    };
    fetchBookings();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-center text-muted">You have no bookings yet.</p>
      ) : (
        <div className="row">
          {bookings.map((booking) => (
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
                      <span className={`badge bg-${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
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

// Helper to style status badge
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

export default TravelerBookings;