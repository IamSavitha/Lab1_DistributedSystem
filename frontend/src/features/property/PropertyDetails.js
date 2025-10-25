import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch property details on mount
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
        
        // OPTIMIZED: Check if this specific property is favorited
        // Instead of fetching all favorites
        checkIfFavorite();
      } catch (err) {
        console.error('Failed to load property details:', err);
        alert('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // OPTIMIZED: Check favorite status for THIS property only
  const checkIfFavorite = async () => {
    try {
      // Backend should provide endpoint: GET /favorites/check/:propertyId
      // Returns { isFavorite: true/false }
      const res = await api.get(`/favorites/check/${id}`);
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      // Fallback: if endpoint doesn't exist, check from all favorites
      try {
        const res = await api.get('/traveler/favorites');
        const favoriteIds = res.data.map(fav => fav.id);
        setIsFavorite(favoriteIds.includes(parseInt(id)));
      } catch (fallbackErr) {
        console.error('Failed to check favorite status:', fallbackErr);
      }
    }
  };

  // Handle add/remove favorite
  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        alert('Removed from favorites!');
      } else {
        await api.post('/favorites', { propertyId: id });
        setIsFavorite(true);
        alert('Added to favorites!');
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      alert('Failed to update favorites. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle booking request
  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      alert('End date must be after start date.');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings/request', {
        propertyId: id,
        startDate,
        endDate,
        guests,
      });
      alert('Booking request submitted successfully!');
      // Clear form
      setStartDate('');
      setEndDate('');
      setGuests(1);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container mt-5" role="main" aria-busy="true">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading property...</span>
          </div>
          <p className="mt-2">Loading property...</p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="container mt-5" role="main">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Property not found</h4>
          <p>The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </main>
    );
  }

  // Calculate total nights and price
  const calculateTotal = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        const pricePerNight = property.price || property.price_per_night;
        return { nights, total: nights * pricePerNight };
      }
    }
    return null;
  };

  const totalInfo = calculateTotal();

  return (
    <main className="container mt-5" role="main">
      {/* Breadcrumb navigation for accessibility */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/traveler/dashboard">Search</a></li>
          <li className="breadcrumb-item active" aria-current="page">{property.name || property.title}</li>
        </ol>
      </nav>

      <div className="row">
        {/* Property Image */}
        <div className="col-md-6 mb-4">
          <img
            src={property.imageUrl || property.image_url || 'https://via.placeholder.com/600x400?text=Property+Image'}
            alt={`${property.name || property.title} - ${property.type} in ${property.location || property.city}`}
            className="img-fluid rounded shadow"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />
        </div>

        {/* Property Info */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="h2">{property.name || property.title}</h1>
              <p className="text-muted">
                <span className="visually-hidden">Location:</span>
                📍 {property.location || property.city}
              </p>
            </div>
            
            {/* Favorite Button */}
            <button
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              style={{ minWidth: '140px' }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
            >
              {favoriteLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : isFavorite ? (
                <>❤️ Favorited</>
              ) : (
                <>🤍 Add to Favorites</>
              )}
            </button>
          </div>

          <p className="lead">{property.description}</p>

          {/* Property Details */}
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h5 card-title">Property Details</h2>
              <dl className="row mb-0">
                <dt className="col-sm-4">Type:</dt>
                <dd className="col-sm-8">{property.type}</dd>
                
                <dt className="col-sm-4">Bedrooms:</dt>
                <dd className="col-sm-8">{property.bedrooms}</dd>
                
                <dt className="col-sm-4">Bathrooms:</dt>
                <dd className="col-sm-8">{property.bathrooms}</dd>
                
                <dt className="col-sm-4">Max Guests:</dt>
                <dd className="col-sm-8">{property.maxGuests || property.max_guests}</dd>
                
                {property.amenities && (
                  <>
                    <dt className="col-sm-4">Amenities:</dt>
                    <dd className="col-sm-8">
                      {typeof property.amenities === 'string' 
                        ? property.amenities 
                        : JSON.parse(property.amenities).join(', ')}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          <p className="h4 text-primary mb-3">
            <span className="visually-hidden">Price:</span>
            ${property.price || property.price_per_night} per night
          </p>
        </div>
      </div>

      {/* Booking Form */}
      <section className="mt-5" aria-labelledby="booking-section">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body">
                <h2 id="booking-section" className="h3 card-title mb-4">Request Booking</h2>
                <form onSubmit={handleBooking} aria-label="Property booking form">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="startDate" className="form-label">Check-in Date</label>
                      <input
                        type="date"
                        id="startDate"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="endDate" className="form-label">Check-out Date</label>
                      <input
                        type="date"
                        id="endDate"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="guests" className="form-label">Number of Guests</label>
                      <input
                        type="number"
                        id="guests"
                        className="form-control"
                        min="1"
                        max={property.maxGuests || property.max_guests || 10}
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Price Summary */}
                  {totalInfo && (
                    <div className="alert alert-info mt-3" role="status" aria-live="polite">
                      <strong>Price Summary:</strong><br />
                      ${property.price || property.price_per_night} × {totalInfo.nights} {totalInfo.nights === 1 ? 'night' : 'nights'} = <strong>${totalInfo.total}</strong>
                    </div>
                  )}

                  <div className="text-end mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg"
                      disabled={bookingLoading}
                      aria-busy={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Booking Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PropertyDetails;