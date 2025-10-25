mport React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function TravelerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings when status filter changes
  useEffect(() => {
    filterBookings();
  }, [statusFilter, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/traveler/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      alert('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on status
  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter(booking => 
          booking.status.toUpperCase() === statusFilter.toUpperCase()
        )
      );
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      
      // Update booking status in local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' }
          : booking
      ));
      
      alert('Booking cancelled successfully.');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Get count by status
  const getStatusCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status.toUpperCase() === status.toUpperCase()).length;
  };

  if (loading) {
    return (
      <main className="container mt-5">
        <p className="text-center">Loading your bookings...</p>
      </main>
    );
  }

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">My Bookings</h2>

      {/* Status Filter Tabs */}
      <div className="mb-4">
        <ul className="nav nav-pills justify-content-center">
          <li className="nav-item">
            <button
              className={`nav-link ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({getStatusCount('all')})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({getStatusCount('pending')})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted ({getStatusCount('accepted')})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${statusFilter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled ({getStatusCount('cancelled')})
            </button>
          </li>
        </ul>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">
            {statusFilter === 'all' 
              ? "You have no bookings yet."
              : `You have no ${statusFilter} bookings.`
            }
          </p>
          <Link to="/traveler/dashboard" className="btn btn-primary">
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="row">
          {filteredBookings.map((booking) => (
            <div className="col-md-6 mb-4" key={booking.id}>
              <div className="card shadow-sm h-100">
                <div className="row g-0">
                  {/* Property Image */}
                  <div className="col-md-4">
                    <img
                      src={booking.property.imageUrl || booking.property.image_url || 'https://via.placeholder.com/200x200?text=Property'}
                      alt={`Image of ${booking.property.name || booking.property.title}`}
                      className="img-fluid rounded-start h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Booking Details */}
                  <div className="col-md-8">
                    <div className="card-body d-flex flex-column h-100">
                      <h5 className="card-title">
                        {booking.property.name || booking.property.title}
                      </h5>
                      <p className="card-text">
                        <small className="text-muted">
                          <i className="bi bi-geo-alt"></i> {booking.property.location || booking.property.city}
                        </small>
                      </p>
                      <p className="card-text">
                        <strong>Check-in:</strong> {booking.startDate || booking.start_date}<br />
                        <strong>Check-out:</strong> {booking.endDate || booking.end_date}
                      </p>
                      <p className="card-text">
                        <strong>Guests:</strong> {booking.guests}
                      </p>
                      {booking.totalPrice || booking.total_price ? (
                        <p className="card-text">
                          <strong>Total:</strong> ${booking.totalPrice || booking.total_price}
                        </p>
                      ) : null}
                      
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`badge bg-${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto">
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/property/${booking.property.id}`}
                            className="btn btn-sm btn-outline-primary flex-grow-1"
                          >
                            View Property
                          </Link>
                          
                          {/* Cancel Button - Only show for PENDING or ACCEPTED bookings */}
                          {(booking.status.toUpperCase() === 'PENDING' || 
                            booking.status.toUpperCase() === 'ACCEPTED') && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                            >
                              {cancellingId === booking.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                'Cancel'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
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
  switch (status.toUpperCase()) {
    case 'ACCEPTED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'secondary';
  }
}

export default TravelerBookings;