import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for API calls
export const customerLogin = createAsyncThunk(
  'auth/customerLogin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://laravel-cc2ba.local/api/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('customerAuthToken', data.token);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://laravel-cc2ba.local/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('adminAuthToken', data.token);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerUser = createAsyncThunk(
  'auth/fetchCustomerUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customerAuthToken');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('https://laravel-cc2ba.local/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('customerAuthToken');
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminUser = createAsyncThunk(
  'auth/fetchAdminUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminAuthToken');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('https://laravel-cc2ba.local/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('adminAuthToken');
      return rejectWithValue(error.message);
    }
  }
);

export const customerLogout = createAsyncThunk(
  'auth/customerLogout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customerAuthToken');
      if (token) {
        await fetch('https://laravel-cc2ba.local/api/customer/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('customerAuthToken');
    }
  }
);

export const adminLogout = createAsyncThunk(
  'auth/adminLogout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminAuthToken');
      if (token) {
        await fetch('https://laravel-cc2ba.local/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminAuthToken');
    }
  }
);

// Initial state
const initialState = {
  customer: {
    user: null,
    token: localStorage.getItem('customerAuthToken'),
    loading: false,
    error: null
  },
  admin: {
    user: null,
    token: localStorage.getItem('adminAuthToken'),
    loading: false,
    error: null
  }
};

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.customer.error = null;
    },
    clearAdminError: (state) => {
      state.admin.error = null;
    },
    clearAllErrors: (state) => {
      state.customer.error = null;
      state.admin.error = null;
    }
  },
  extraReducers: (builder) => {
    // Customer Login
    builder
      .addCase(customerLogin.pending, (state) => {
        state.customer.loading = true;
        state.customer.error = null;
      })
      .addCase(customerLogin.fulfilled, (state, action) => {
        state.customer.loading = false;
        state.customer.user = action.payload.user;
        state.customer.token = action.payload.token;
        state.customer.error = null;
      })
      .addCase(customerLogin.rejected, (state, action) => {
        state.customer.loading = false;
        state.customer.error = action.payload;
      });

    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.admin.loading = true;
        state.admin.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.admin.loading = false;
        state.admin.user = action.payload.user;
        state.admin.token = action.payload.token;
        state.admin.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.admin.loading = false;
        state.admin.error = action.payload;
      });

    // Fetch Customer User
    builder
      .addCase(fetchCustomerUser.pending, (state) => {
        state.customer.loading = true;
        state.customer.error = null;
      })
      .addCase(fetchCustomerUser.fulfilled, (state, action) => {
        state.customer.loading = false;
        state.customer.user = action.payload;
        state.customer.error = null;
      })
      .addCase(fetchCustomerUser.rejected, (state, action) => {
        state.customer.loading = false;
        state.customer.error = action.payload;
        state.customer.user = null;
        state.customer.token = null;
      });

    // Fetch Admin User
    builder
      .addCase(fetchAdminUser.pending, (state) => {
        state.admin.loading = true;
        state.admin.error = null;
      })
      .addCase(fetchAdminUser.fulfilled, (state, action) => {
        state.admin.loading = false;
        state.admin.user = action.payload;
        state.admin.error = null;
      })
      .addCase(fetchAdminUser.rejected, (state, action) => {
        state.admin.loading = false;
        state.admin.error = action.payload;
        state.admin.user = null;
        state.admin.token = null;
      });

    // Customer Logout
    builder
      .addCase(customerLogout.fulfilled, (state) => {
        state.customer.user = null;
        state.customer.token = null;
        state.customer.error = null;
      });

    // Admin Logout
    builder
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin.user = null;
        state.admin.token = null;
        state.admin.error = null;
      });
  }
});

export const { clearCustomerError, clearAdminError, clearAllErrors } = authSlice.actions;

export default authSlice.reducer; 