import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { adminLogout } from '../store/slices/authSlice';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth.admin);

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchAdminData();
  }, [token, navigate]);

  const fetchAdminData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('https://laravel-cc2ba.local/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch users list
      const usersResponse = await fetch('https://laravel-cc2ba.local/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleLogout = async () => {
    await dispatch(adminLogout());
    navigate('/admin/login');
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`https://laravel-cc2ba.local/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role_id: editingUser.role_id,
        }),
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`https://laravel-cc2ba.local/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
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
        <title>Admin Dashboard | React App</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={() => navigate('/admin/profile')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total_users}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Total Customers</h3>
                <p className="text-3xl font-bold text-green-600">{stats.total_customers}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Total Admins</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.total_admins}</p>
              </div>
            </div>
          )}

          {/* Users Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Users Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser?.id === user.id ? (
                          <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser?.id === user.id ? (
                          <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{user.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.role_id}
                            onChange={(e) => setEditingUser({...editingUser, role_id: parseInt(e.target.value)})}
                            className="border rounded px-2 py-1"
                          >
                            <option value={1}>Admin</option>
                            <option value={2}>Customer</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role?.name === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role?.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingUser?.id === user.id ? (
                          <div className="space-x-2">
                            <button
                              onClick={handleUpdateUser}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard; 