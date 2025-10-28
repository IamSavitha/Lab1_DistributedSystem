import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Use the correct API path
      const res = await api.get('/bookings/owner');
      // Extract bookings array from response
      setBookings(res.data.bookings || []);
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

  // Handle accept booking
  const handleAcceptBooking = async (bookingId) => {
    if (!window.confirm('Accept this booking? This will block the property for these dates.')) {
      return;
    }

    setProcessingId(bookingId);
    try {
      // Use correct API path /bookings/owner/:id/accept
      await api.put(`/bookings/owner/${bookingId}/accept`);
      
      // Update booking status in local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'ACCEPTED' }
          : booking
      ));
      
      alert('Booking accepted successfully!');
    } catch (err) {
      console.error('Failed to accept booking:', err);
      alert('Failed to accept booking. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will release the dates.')) {
      return;
    }

    setProcessingId(bookingId);
    try {
      // Use correct API path /bookings/owner/:id/cancel
      await api.put(`/bookings/owner/${bookingId}/cancel`);
      
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
      setProcessingId(null);
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
        <p className="text-center">Loading bookings...</p>
      </main>
    );
  }

  return (
    <main className="container mt-5">
      <h2 className="text-center mb-4">Received Bookings</h2>

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
          <p className="text-muted">
            {statusFilter === 'all' 
              ? "No bookings received yet."
              : `No ${statusFilter} bookings.`
            }
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Property</th>
                <th>Traveler</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  {/* Property - using correct data structure */}
                  <td>
                    <div className="d-flex align-items-center">
                      {booking.property?.image_url && (
                        <img 
                          src={booking.property.image_url}
                          alt={booking.property.name}
                          className="rounded me-2"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <strong>{booking.property?.name || 'N/A'}</strong>
                        <br />
                        <small className="text-muted">
                          {booking.property?.location || 'N/A'}
                        </small>
                      </div>
                    </div>
                  </td>
                  
                  {/* Traveler - using correct data structure */}
                  <td>
                    <strong>{booking.traveler?.name || 'N/A'}</strong>
                    <br />
                    <small className="text-muted">{booking.traveler?.email || 'N/A'}</small>
                  </td>
                  
                  {/* Check-in */}
                  <td>{booking.startDate || booking.start_date || 'N/A'}</td>
                  
                  {/* Check-out */}
                  <td>{booking.endDate || booking.end_date || 'N/A'}</td>
                  
                  {/* Guests */}
                  <td>{booking.guests || 'N/A'}</td>
                  
                  {/* Total Price */}
                  <td>
                    {booking.totalPrice || booking.total_price 
                      ? `$${booking.totalPrice || booking.total_price}`
                      : 'N/A'
                    }
                  </td>
                  
                  {/* Status */}
                  <td>
                    <span className={`badge bg-${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td>
                    {booking.status.toUpperCase() === 'PENDING' && (
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAcceptBooking(booking.id)}
                          disabled={processingId === booking.id}
                          title="Accept booking"
                        >
                          {processingId === booking.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            'Accept'
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={processingId === booking.id}
                          title="Cancel booking"
                        >
                          {processingId === booking.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            'Cancel'
                          )}
                        </button>
                      </div>
                    )}
                    
                    {booking.status.toUpperCase() === 'ACCEPTED' && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={processingId === booking.id}
                      >
                        {processingId === booking.id ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    )}
                    
                    {booking.status.toUpperCase() === 'CANCELLED' && (
                      <span className="text-muted">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {bookings.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">{getStatusCount('pending')}</h5>
                <p className="card-text">Pending</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{getStatusCount('accepted')}</h5>
                <p className="card-text">Accepted</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-danger">{getStatusCount('cancelled')}</h5>
                <p className="card-text">Cancelled</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{bookings.length}</h5>
                <p className="card-text">Total Bookings</p>
              </div>
            </div>
          </div>
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

export default OwnerBookings;
