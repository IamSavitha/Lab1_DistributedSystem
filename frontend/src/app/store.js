// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import travelerReducer from '../features/traveler/travelerSlice';

export const store = configureStore({
  reducer: {
    traveler: travelerReducer,
  },
});