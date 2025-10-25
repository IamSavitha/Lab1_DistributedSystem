import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function PropertyDetails() {
  const { id } = useParams(); // Get property ID from URL
  const [property, setProperty] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);

  // Fetch property details on mount
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        alert('Failed to load property details.');
      }
    };
    fetchProperty();
  }, [id]);

  // Handle booking request
  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings/request', {
        propertyId: id,
        startDate,
        endDate,
        guests,
      });
      alert('Booking request submitted!');
    } catch (err) {
      alert('Booking failed. Please try again.');
    }
  };

  if (!property) return <p className="text-center mt-5">Loading property...</p>;

  return (
    <main className="container mt-5">
      <div className="row">
        {/* Property Image */}
        <div className="col-md-6">
          <img
            src={property.imageUrl}
            alt={`Image of ${property.name}`}
            className="img-fluid rounded"
          />
        </div>

        {/* Property Info */}
        <div className="col-md-6">
          <h2>{property.name}</h2>
          <p className="text-muted">{property.location}</p>
          <p>{property.description}</p>
          <ul>
            <li>Type: {property.type}</li>
            <li>Bedrooms: {property.bedrooms}</li>
            <li>Bathrooms: {property.bathrooms}</li>
            <li>Max Guests: {property.maxGuests}</li>
          </ul>
          <h4 className="mt-3">${property.price} / night</h4>
        </div>
      </div>

      {/* Booking Form */}
      <section className="mt-5">
        <h3>Request Booking</h3>
        <form className="row g-3" onSubmit={handleBooking} aria-label="Booking form">
          <div className="col-md-4">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input
              type="date"
              id="startDate"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input
              type="date"
              id="endDate"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="guests" className="form-label">Guests</label>
            <input
              type="number"
              id="guests"
              className="form-control"
              min="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
            />
          </div>
          <div className="col-12 text-end">
            <button type="submit" className="btn btn-success">Submit Request</button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default PropertyDetails;