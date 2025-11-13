import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as propertyAPI from '../../services/propertyAPI';

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.searchProperties(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertyById(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property details');
    }
  }
);

const initialState = {
  properties: [],
  propertyDetail: null,
  searchFilters: {
    location: '',
    checkIn: null,
    checkOut: null,
    guests: 1,
    minPrice: 0,
    maxPrice: 10000,
  },
  loading: false,
  error: null,
  totalResults: 0,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
    },
    clearPropertyDetail: (state) => {
      state.propertyDetail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties || action.payload;
        state.totalResults = action.payload.total || action.payload.length;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch property by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyDetail = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSearchFilters, 
  clearSearchFilters, 
  clearPropertyDetail, 
  clearError 
} = propertySlice.actions;

export default propertySlice.reducer;
