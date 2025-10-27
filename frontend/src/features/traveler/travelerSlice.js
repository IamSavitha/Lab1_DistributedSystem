import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  travelerInfo: null,
  isLoggedIn: false,
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
      state.travelerInfo = action.payload;
      state.isLoggedIn = true;
    },
    logoutTraveler(state) {
      state.travelerInfo = null;
      state.isLoggedIn = false;
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