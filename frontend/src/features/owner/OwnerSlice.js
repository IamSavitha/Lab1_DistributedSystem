// src/features/owner/ownerSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initialize from localStorage on page load
const savedToken = localStorage.getItem('owner_token');
const savedOwnerInfo = localStorage.getItem('owner_info');

const initialState = {
  ownerInfo: savedOwnerInfo ? JSON.parse(savedOwnerInfo) : null,
  token: savedToken, // JWT token stored in Redux (Lab 2 Part 4 requirement)
  isLoggedIn: !!savedToken,
};

const ownerSlice = createSlice({
  name: 'owner',
  initialState,
  reducers: {
    loginOwner(state, action) {
      state.ownerInfo = action.payload.owner || action.payload;
      state.token = action.payload.token; // Store JWT token in Redux
      state.isLoggedIn = true;
      
      // Also store in localStorage for API requests and persistence
      if (action.payload.token) {
        localStorage.setItem('owner_token', action.payload.token);
      }
      if (action.payload.owner) {
        localStorage.setItem('owner_info', JSON.stringify(action.payload.owner));
      }
    },
    logoutOwner(state) {
      state.ownerInfo = null;
      state.token = null;
      state.isLoggedIn = false;
      
      // Clear from localStorage
      localStorage.removeItem('owner_token');
      localStorage.removeItem('owner_info');
    },
    updateOwnerProfile(state, action) {
      if (state.ownerInfo) {
        state.ownerInfo = {
          ...state.ownerInfo,
          ...action.payload,
        };
        // Update localStorage
        localStorage.setItem('owner_info', JSON.stringify(state.ownerInfo));
      }
    },
  },
});

export const { loginOwner, logoutOwner, updateOwnerProfile } = ownerSlice.actions;
export default ownerSlice.reducer;
