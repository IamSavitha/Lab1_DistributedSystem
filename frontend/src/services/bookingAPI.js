import api from './api';

// Create a new booking
export const createBooking = async (bookingData) => {
  return await api.post('/bookings/request', bookingData);
};

// Get traveler's active bookings
export const getMyBookings = async () => {
  return await api.get('/bookings/traveler');
};

// Get booking history (completed/cancelled)
export const getBookingHistory = async () => {
  return await api.get('/bookings/traveler/history');
};

// Get single booking details
export const getBookingById = async (bookingId) => {
  return await api.get(`/bookings/${bookingId}`);
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  return await api.patch(`/bookings/${bookingId}/cancel`);
};

// Add property to favorites
export const addToFavorites = async (propertyId) => {
  return await api.post('/favorites', { propertyId });
};

// Remove property from favorites
export const removeFromFavorites = async (propertyId) => {
  return await api.delete(`/favorites/${propertyId}`);
};

// Get all favorites
export const getFavorites = async () => {
  return await api.get('/favorites');
};

// Check if property is in favorites
export const isFavorite = async (propertyId) => {
  return await api.get(`/favorites/check/${propertyId}`);
};

// Owner APIs
// Get bookings for owner's properties
export const getOwnerBookings = async () => {
  return await api.get('/owner/bookings');
};

// Update booking status (owner)
export const updateBookingStatus = async (bookingId, status) => {
  return await api.patch(`/owner/bookings/${bookingId}/status`, { status });
};
