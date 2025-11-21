import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initialize from localStorage on page load
const savedToken = localStorage.getItem('traveler_token');
const savedTravelerInfo = localStorage.getItem('traveler_info');

const initialState = {
  travelerInfo: savedTravelerInfo ? JSON.parse(savedTravelerInfo) : null,
  token: savedToken, // JWT token stored in Redux (Lab 2 Part 4 requirement)
  isLoggedIn: !!savedToken,
  loading: false,
  error: null,
};

// Async thunk for signup
export const signupTraveler = createAsyncThunk(
  'traveler/signup',
  async ({ userData, navigate }, { rejectWithValue }) => {
    try {
      const response = await api.post('/traveler/signup', userData);
      
      // Success - navigate to login
      navigate('/traveler/login');
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Signup failed');
    }
  }
);

const travelerSlice = createSlice({
  name: 'traveler',
  initialState,
  reducers: {
    loginTraveler(state, action) {
      state.travelerInfo = action.payload.traveler || action.payload;
      state.token = action.payload.token; // Store JWT token in Redux
      state.isLoggedIn = true;
      
      // Also store in localStorage for API requests and persistence
      if (action.payload.token) {
        localStorage.setItem('traveler_token', action.payload.token);
      }
      if (action.payload.traveler || action.payload) {
        const travelerData = action.payload.traveler || action.payload;
        localStorage.setItem('traveler_info', JSON.stringify(travelerData));
      }
    },
    logoutTraveler(state) {
      state.travelerInfo = null;
      state.token = null;
      state.isLoggedIn = false;
      
      // Clear from localStorage
      localStorage.removeItem('traveler_token');
      localStorage.removeItem('traveler_info');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupTraveler.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupTraveler.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupTraveler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginTraveler, logoutTraveler } = travelerSlice.actions;
export default travelerSlice.reducer;
