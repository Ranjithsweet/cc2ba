import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { customerLogout } from '../../store/slices/authSlice';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error, token } = useAppSelector(state => state.auth.customer);

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = async () => {
    await dispatch(customerLogout());
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | React App</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome!</h2>
                <p className="text-gray-600">
                  You have successfully logged into your customer dashboard. Here you can manage your profile, 
                  view your account details, and access various services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard; 