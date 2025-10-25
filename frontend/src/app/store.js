// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import travelerReducer from '../features/traveler/travelerSlice';
import ownerReducer from '../features/owner/ownerSlice';

export const store = configureStore({
  reducer: {
    traveler: travelerReducer,
    owner: ownerReducer,
  },
});