// src/features/owner/ownerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ownerInfo: null,
  isLoggedIn: false,
};

const ownerSlice = createSlice({
  name: 'owner',
  initialState,
  reducers: {
    loginOwner(state, action) {
      state.ownerInfo = action.payload;
      state.isLoggedIn = true;
    },
    logoutOwner(state) {
      state.ownerInfo = null;
      state.isLoggedIn = false;
    },
    updateOwnerProfile(state, action) {
      if (state.ownerInfo) {
        state.ownerInfo = {
          ...state.ownerInfo,
          ...action.payload,
        };
      }
    },
  },
});

export const { loginOwner, logoutOwner, updateOwnerProfile } = ownerSlice.actions;
export default ownerSlice.reducer;