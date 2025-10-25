import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/owner/bookings');
        setBookings(res.data);
      } catch (err) {
        alert('Failed to load bookings.');
      }
    };
    fetchBookings();
  }, []);

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Received Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-center text-muted">No bookings received yet.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Property</th>
              <th>Traveler</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.property.name}</td>
                <td>{booking.traveler.name}</td>
                <td>{booking.checkInDate}</td>
                <td>{booking.checkOutDate}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default OwnerBookings;