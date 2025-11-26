import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { jwtDecode } from 'jwt-decode';

// Helper function to get traveler info from token
const getTravelerFromToken = () => {
  const token = localStorage.getItem('travelerToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return { id: decoded.id, _id: decoded.id, email: decoded.email };
    } catch (error) {
      localStorage.removeItem('travelerToken');
      return null;
    }
  }
  return null;
};

const initialState = {
  travelerInfo: getTravelerFromToken(),
  token: localStorage.getItem('travelerToken') || null,
  isLoggedIn: !!localStorage.getItem('travelerToken'),
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
      const { traveler, token } = action.payload;
      state.travelerInfo = traveler || getTravelerFromToken();
      state.token = token;
      state.isLoggedIn = true;

      // Store token in localStorage
      if (token) {
        localStorage.setItem('travelerToken', token);
        // Decode token to get user info if traveler not provided
        if (!traveler) {
          try {
            const decoded = jwtDecode(token);
            state.travelerInfo = { id: decoded.id, _id: decoded.id, email: decoded.email };
          } catch (e) {
            console.error('Failed to decode token:', e);
          }
        }
      }
    },
    logoutTraveler(state) {
      state.travelerInfo = null;
      state.token = null;
      state.isLoggedIn = false;

      // Remove token from localStorage
      localStorage.removeItem('travelerToken');
    },
    setTravelerFromToken(state, action) {
      const token = action.payload;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          state.travelerInfo = { id: decoded.id, _id: decoded.id, email: decoded.email };
          state.token = token;
          state.isLoggedIn = true;
        } catch (error) {
          // Invalid token
          state.token = null;
          state.isLoggedIn = false;
          localStorage.removeItem('travelerToken');
        }
      }
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

export const { loginTraveler, logoutTraveler, setTravelerFromToken } = travelerSlice.actions;
export default travelerSlice.reducer;