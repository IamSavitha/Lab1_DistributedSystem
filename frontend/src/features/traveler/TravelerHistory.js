import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookingHistory } from '../../features/booking/bookingSlice';

function TravelerHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { history, loading, error } = useSelector((state) => state.booking);

  // Fetch booking history on component mount
  useEffect(() => {
    dispatch(fetchBookingHistory());
  }, [dispatch]);

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'rejected':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate nights
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights : 0;
  };

  // Handle view property
  const handleViewProperty = (propertyId) => {
    navigate(`/traveler/property/${propertyId}`);
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2>Booking History</h2>
          <p className="text-muted">Your past and cancelled bookings</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your booking history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-clock-history" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          </div>
          <h4>No booking history</h4>
          <p className="text-muted">You don't have any past bookings yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/traveler/dashboard')}>
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {history.map((booking) => (
            <div key={booking.id} className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    {/* Property Image */}
                    <div className="col-md-3">
                      {booking.property?.images && booking.property.images.length > 0 ? (
                        <img
                          src={booking.property.images[0]}
                          alt={booking.property.title || booking.property.name}
                          className="img-fluid rounded"
                          style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                        />
                      ) : booking.property?.image_url || booking.property?.imageUrl ? (
                        <img
                          src={booking.property.image_url || booking.property.imageUrl}
                          alt={booking.property.title || booking.property.name}
                          className="img-fluid rounded"
                          style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-secondary rounded d-flex align-items-center justify-content-center"
                          style={{ height: '150px' }}
                        >
                          <span className="text-white">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="mb-0">{booking.property?.title || booking.property?.name || booking.property_name || 'Property'}</h5>
                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                          {booking.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-muted mb-2">
                        <i className="bi bi-geo-alt"></i> {booking.property?.location || booking.location}
                      </p>
                      <div className="mb-2">
                        <strong>Check-in:</strong> {formatDate(booking.startDate || booking.start_date)}
                        <br />
                        <strong>Check-out:</strong> {formatDate(booking.endDate || booking.end_date)}
                        <br />
                        <strong>Duration:</strong> {calculateNights(booking.startDate || booking.start_date, booking.endDate || booking.end_date)} nights
                        <br />
                        <strong>Guests:</strong> {booking.guests}
                      </div>
                      {booking.completedAt && (
                        <p className="mb-0 text-muted small">
                          Completed on: {formatDate(booking.completedAt)}
                        </p>
                      )}
                      {booking.cancelledAt && (
                        <p className="mb-0 text-muted small">
                          Cancelled on: {formatDate(booking.cancelledAt)}
                        </p>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="col-md-3 d-flex flex-column justify-content-between">
                      <div>
                        <h4 className="text-primary mb-0">${booking.totalPrice || booking.total_price}</h4>
                        <p className="text-muted small">Total Price</p>
                      </div>
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleViewProperty(booking.property?.id || booking.propertyId)}
                        >
                          View Property
                        </button>
                        {booking.status === 'completed' && (
                          <button className="btn btn-outline-secondary btn-sm">
                            Book Again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TravelerHistory;
