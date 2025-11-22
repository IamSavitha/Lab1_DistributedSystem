import { configureStore } from '@reduxjs/toolkit';
import travelerReducer from '../features/traveler/travelerSlice';
import ownerReducer from '../features/owner/OwnerSlice';
import propertyReducer from '../features/property/propertySlice';
import bookingReducer from '../features/booking/bookingSlice';

const store = configureStore({
  reducer: {
    traveler: travelerReducer,
    owner: ownerReducer,
    property: propertyReducer,
    booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
