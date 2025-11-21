// src/features/owner/ownerSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const initialState = {
  ownerInfo: null,
  token: localStorage.getItem('ownerToken') || null,
  isLoggedIn: !!localStorage.getItem('ownerToken'),
};

const ownerSlice = createSlice({
  name: 'owner',
  initialState,
  reducers: {
    loginOwner(state, action) {
      const { owner, token } = action.payload;
      state.ownerInfo = owner;
      state.token = token;
      state.isLoggedIn = true;

      // Store token in localStorage
      if (token) {
        localStorage.setItem('ownerToken', token);
      }
    },
    logoutOwner(state) {
      state.ownerInfo = null;
      state.token = null;
      state.isLoggedIn = false;

      // Remove token from localStorage
      localStorage.removeItem('ownerToken');
    },
    updateOwnerProfile(state, action) {
      if (state.ownerInfo) {
        state.ownerInfo = {
          ...state.ownerInfo,
          ...action.payload,
        };
      }
    },
    setOwnerFromToken(state, action) {
      const token = action.payload;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          state.ownerInfo = { id: decoded.id, email: decoded.email };
          state.token = token;
          state.isLoggedIn = true;
        } catch (error) {
          // Invalid token
          state.token = null;
          state.isLoggedIn = false;
          localStorage.removeItem('ownerToken');
        }
      }
    },
  },
});

export const { loginOwner, logoutOwner, updateOwnerProfile, setOwnerFromToken } = ownerSlice.actions;
export default ownerSlice.reducer;