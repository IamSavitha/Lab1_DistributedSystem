import React from 'react';
import { Link } from 'react-router-dom';

// Property Card Component - displays property information in search results
function PropertyCard({ property }) {
  // Handle both MongoDB (_id) and MySQL (id) formats
  const propertyId = property._id || property.id;
  
  // Handle both naming conventions (camelCase and snake_case)
  const title = property.title || property.name;
  const location = property.location || `${property.city || ''}, ${property.country || ''}`.trim();
  const price = property.pricePerNight || property.price_per_night || property.price;
  const guests = property.guests || property.maxGuests || property.max_guests;
  const description = property.description;
  
  // Handle both image formats (array or single URL)
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : property.imageUrl || property.image_url || 'https://via.placeholder.com/400x300?text=Property+Image';

  return (
    <div className="card h-100 shadow-sm">
      {/* Property Image */}
      <img 
        src={imageUrl} 
        className="card-img-top" 
        alt={title}
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
        }}
      />
      
      <div className="card-body d-flex flex-column">
        {/* Property Title */}
        <h5 className="card-title">{title}</h5>

        {/* Location */}
        <p className="text-muted mb-2">
          <i className="bi bi-geo-alt"></i> {location}
        </p>

        {/* Description */}
        {description && (
          <p className="card-text text-muted small mb-3" style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {description}
          </p>
        )}

        {/* Property Details */}
        {guests && (
          <div className="mb-3">
            <small className="text-muted">
              <i className="bi bi-people"></i> {guests} guests
            </small>
          </div>
        )}

        {/* Price and View Button */}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0 text-primary">${price}</h4>
            <small className="text-muted">per night</small>
          </div>
          <Link 
            to={`/traveler/property/${propertyId}`} 
            className="btn btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
