import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function PropertyDetails() {
  const { id } = useParams(); // Get property ID from URL
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
        
        // Check if property is already favorited
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

  // Check if property is in favorites
  const checkIfFavorite = async () => {
    try {
      const res = await api.get('/traveler/favorites');
      const favoriteIds = res.data.map(fav => fav.id);
      setIsFavorite(favoriteIds.includes(parseInt(id)));
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  };

  // Handle add/remove favorite
  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        alert('Removed from favorites!');
      } else {
        // Add to favorites
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
    return <p className="text-center mt-5">Loading property...</p>;
  }

  if (!property) {
    return <p className="text-center mt-5">Property not found.</p>;
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
    <main className="container mt-5">
      <div className="row">
        {/* Property Image */}
        <div className="col-md-6 mb-4">
          <img
            src={property.imageUrl || property.image_url || 'https://via.placeholder.com/600x400?text=Property+Image'}
            alt={`Image of ${property.name || property.title}`}
            className="img-fluid rounded shadow"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />
        </div>

        {/* Property Info */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2>{property.name || property.title}</h2>
              <p className="text-muted">
                <i className="bi bi-geo-alt-fill"></i> {property.location || property.city}
              </p>
            </div>
            
            {/* Favorite Button */}
            <button
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              style={{ minWidth: '120px' }}
            >
              {favoriteLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : isFavorite ? (
                <>Favorited</>
              ) : (
                <>Add to Favorites</>
              )}
            </button>
          </div>

          <p className="lead">{property.description}</p>

          {/* Property Details */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Property Details</h5>
              <ul className="list-unstyled">
                <li><strong>Type:</strong> {property.type}</li>
                <li><strong>Bedrooms:</strong> {property.bedrooms}</li>
                <li><strong>Bathrooms:</strong> {property.bathrooms}</li>
                <li><strong>Max Guests:</strong> {property.maxGuests || property.max_guests}</li>
                {property.amenities && (
                  <li><strong>Amenities:</strong> {
                    typeof property.amenities === 'string' 
                      ? property.amenities 
                      : JSON.parse(property.amenities).join(', ')
                  }</li>
                )}
              </ul>
            </div>
          </div>

          <h4 className="text-primary mb-3">
            ${property.price || property.price_per_night} / night
          </h4>
        </div>
      </div>

      {/* Booking Form */}
      <section className="mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">Request Booking</h3>
                <form onSubmit={handleBooking} aria-label="Booking form">
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
                      />
                    </div>
                  </div>

                  {/* Price Summary */}
                  {totalInfo && (
                    <div className="alert alert-info mt-3" role="alert">
                      <strong>Price Summary:</strong><br />
                      ${property.price || property.price_per_night} x {totalInfo.nights} {totalInfo.nights === 1 ? 'night' : 'nights'} = <strong>${totalInfo.total}</strong>
                    </div>
                  )}

                  <div className="text-end mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Submitting...' : 'Submit Booking Request'}
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