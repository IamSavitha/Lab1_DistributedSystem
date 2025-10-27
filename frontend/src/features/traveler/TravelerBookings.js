import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AgentButton from '../../components/AgentButton';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Parse ISO date string and format as YYYY-MM-DD
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    // If date string is already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    return dateString;
  }
};

function TravelerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      console.log('Fetching bookings from /bookings/traveler...');
      const res = await api.get('/bookings/traveler');
      console.log('Bookings response:', res.data);
      
      // Handle different response formats
      const bookingsList = res.data.bookings || res.data;
      console.log('Bookings list:', bookingsList);
      
      // Debug: log each booking status
      if (Array.isArray(bookingsList)) {
        bookingsList.forEach((booking, idx) => {
          console.log(`Booking ${idx + 1}:`, {
            id: booking.id,
            status: booking.status,
            property: booking.property?.name || booking.property_name,
            startDate: booking.startDate || booking.start_date
          });
        });
      }
      
      setBookings(Array.isArray(bookingsList) ? bookingsList : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 404) {
        setError('Bookings API not found. Please contact support.');
      } else {
        setError(err.response?.data?.error || 'Failed to load bookings.');
      }
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
          booking.status?.toUpperCase() === statusFilter.toUpperCase()
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
      alert(err.response?.data?.error || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Get count by status
  const getStatusCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status?.toUpperCase() === status.toUpperCase()).length;
  };

  if (loading) {
    return (
      <main className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your bookings...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Bookings</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <button className="btn btn-primary" onClick={fetchBookings}>
              Try Again
            </button>
            {' '}
            <Link to="/traveler/dashboard" className="btn btn-secondary">
              Back to Search
            </Link>
          </p>
        </div>
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
                      src={booking.property?.imageUrl || booking.property?.image_url || 'https://placehold.co/200x200/e0e0e0/666666?text=Property'}
                      alt={`Image of ${booking.property?.name || booking.property?.title || 'Property'}`}
                      className="img-fluid rounded-start h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        // Fallback to a simple gray box if image fails to load
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3Ctext fill="%23666666" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  
                  {/* Booking Details */}
                  <div className="col-md-8">
                    <div className="card-body d-flex flex-column h-100">
                      <h5 className="card-title">
                        {booking.property?.name || booking.property?.title || booking.property_name || 'Property'}
                      </h5>
                      <p className="card-text">
                        <small className="text-muted">
                          <i className="bi bi-geo-alt"></i> {booking.property?.location || booking.property?.city || booking.location || 'Location'}
                        </small>
                      </p>
                      <p className="card-text">
                        <strong>Check-in:</strong> {formatDate(booking.startDate || booking.start_date)}<br />
                        <strong>Check-out:</strong> {formatDate(booking.endDate || booking.end_date)}
                      </p>
                      <p className="card-text">
                        <strong>Guests:</strong> {booking.guests || 'N/A'}
                      </p>
                      {(booking.totalPrice || booking.total_price) && (
                        <p className="card-text">
                          <strong>Total:</strong> ${booking.totalPrice || booking.total_price}
                        </p>
                      )}
                      
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`badge bg-${getStatusColor(booking.status)}`}>
                          {booking.status || 'UNKNOWN'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto">
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/property/${booking.property?.id || booking.property_id}`}
                            className="btn btn-sm btn-outline-primary flex-grow-1"
                          >
                            View Property
                          </Link>
                          
                          {/* Cancel Button - Only show for PENDING or ACCEPTED bookings */}
                          {(booking.status?.toUpperCase() === 'PENDING' || 
                            booking.status?.toUpperCase() === 'ACCEPTED') && (
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
      <AgentButton />
    </main>
  );
}

// Helper to style status badge
function getStatusColor(status) {
  if (!status) return 'secondary';
  
  switch (status.toUpperCase()) {
    case 'ACCEPTED':
    case 'CONFIRMED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
    case 'REJECTED':
      return 'danger';
    case 'COMPLETED':
      return 'info';
    default:
      return 'secondary';
  }
}

export default TravelerBookings;
