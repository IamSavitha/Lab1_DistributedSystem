import api from './api';

// Create a new booking request
export const createBooking = (bookingData) => {
  return api.post('/bookings/request', bookingData);
};

// Get traveler's bookings
export const getMyBookings = () => {
  return api.get('/bookings/traveler');
};

// Get traveler's booking history
export const getBookingHistory = () => {
  return api.get('/bookings/traveler/history');
};

// ✅ Cancel booking (Traveler)
export const cancelBooking = (bookingId) => {
  return api.put(`/bookings/${bookingId}/cancel`);
};

// Add property to favorites
export const addToFavorites = (propertyId) => {
  return api.post('/favorites', { propertyId });
};

// Remove property from favorites
export const removeFromFavorites = (propertyId) => {
  return api.delete(`/favorites/${propertyId}`);
};

// Get user's favorites
export const getFavorites = () => {
  return api.get('/favorites');
};

// Check if property is favorited
export const checkFavorite = (propertyId) => {
  return api.get(`/favorites/check/${propertyId}`);
};
