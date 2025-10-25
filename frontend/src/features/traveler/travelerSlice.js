// src/features/traveler/travelerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  travelerInfo: null,
  isLoggedIn: false,
};

const travelerSlice = createSlice({
  name: 'traveler',
  initialState,
  reducers: {
    loginTraveler(state, action) {
      state.travelerInfo = action.payload;
      state.isLoggedIn = true;
    },
    logoutTraveler(state) {
      state.travelerInfo = null;
      state.isLoggedIn = false;
    },
  },
});

export const { loginTraveler, logoutTraveler } = travelerSlice.actions;
export default travelerSlice.reducer;