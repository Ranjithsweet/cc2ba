import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './utils/ScrollToTop';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCustomerUser, fetchAdminUser } from './store/slices/authSlice';

// Component to handle initial auth state
function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { customer, admin } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch user data if tokens exist
    if (customer.token && !customer.user) {
      dispatch(fetchCustomerUser());
    }
    if (admin.token && !admin.user) {
      dispatch(fetchAdminUser());
    }
  }, [dispatch, customer.token, customer.user, admin.token, admin.user]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthInitializer />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
