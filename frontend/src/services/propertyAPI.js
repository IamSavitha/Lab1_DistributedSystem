import api from './api';

// Search properties with filters
export const searchProperties = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.location) params.append('location', filters.location);
  if (filters.checkIn) params.append('checkIn', filters.checkIn);
  if (filters.checkOut) params.append('checkOut', filters.checkOut);
  if (filters.guests) params.append('guests', filters.guests);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  
  return await api.get(`/properties?${params.toString()}`);
};

// Get property by ID
export const getPropertyById = async (propertyId) => {
  return await api.get(`/properties/${propertyId}`);
};

// Get all properties (for owner)
export const getAllProperties = async () => {
  return await api.get('/properties');
};

// Create property (for owner)
export const createProperty = async (propertyData) => {
  return await api.post('/properties', propertyData);
};

// Update property (for owner)
export const updateProperty = async (propertyId, propertyData) => {
  return await api.put(`/properties/${propertyId}`, propertyData);
};

// Delete property (for owner)
export const deleteProperty = async (propertyId) => {
  return await api.delete(`/properties/${propertyId}`);
};

// Get property availability
export const checkAvailability = async (propertyId, checkIn, checkOut) => {
  return await api.get(`/properties/${propertyId}/availability`, {
    params: { checkIn, checkOut }
  });
};
