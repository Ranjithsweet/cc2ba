import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { adminLogout } from '../store/slices/authSlice';
import Webcam from 'react-webcam';

function AdminProfile() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUpdatingFace, setIsUpdatingFace] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth.admin);
  const webcamRef = useRef(null);

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Set initial profile data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [token, navigate, user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage('');

    try {
      const response = await fetch('https://laravel-cc2ba.local/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
      } else {
        setMessage(data.message || 'Failed to update profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while updating profile');
      setMessageType('error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCapturing(false);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(true);
  };

  const updateFace = async () => {
    if (!capturedImage) return;

    setIsUpdatingFace(true);
    setMessage('');

    try {
      const response = await fetch('https://laravel-cc2ba.local/api/admin/update-face', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          face_image: capturedImage
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Face data updated successfully!');
        setMessageType('success');
        setCapturedImage(null);
        setIsCapturing(false);
      } else {
        setMessage(data.message || 'Failed to update face data');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while updating face data');
      setMessageType('error');
    } finally {
      setIsUpdatingFace(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(adminLogout());
    navigate('/admin/login');
  };

  const videoConstraints = {
    width: 400,
    height: 300,
    facingMode: "user"
  };

  return (
    <>
      <Helmet>
        <title>Admin Profile | React App</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Dashboard
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    value={user?.role?.name || 'Admin'}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Face Recognition Update */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Face Recognition</h2>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Update your face recognition data for secure login.</p>
                  <p className="mt-2">
                    <strong>Current Status:</strong> {user?.face_data ? 'Face data registered' : 'No face data registered'}
                  </p>
                </div>

                {!isCapturing && !capturedImage && (
                  <button
                    type="button"
                    onClick={() => setIsCapturing(true)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Start Camera
                  </button>
                )}

                {isCapturing && (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={capture}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCapturing(false)}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Retake Photo
                      </button>
                      <button
                        type="button"
                        onClick={updateFace}
                        disabled={isUpdatingFace}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdatingFace ? 'Updating...' : 'Update Face Data'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminProfile; 