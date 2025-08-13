import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { adminLogin, clearAdminError } from '../store/slices/authSlice';
import Webcam from 'react-webcam';

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'face'
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isRegisteringFace, setIsRegisteringFace] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector(state => state.auth.admin);
  const webcamRef = useRef(null);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) dispatch(clearAdminError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loginMethod === 'password') {
      const result = await dispatch(adminLogin({ 
        email: formData.email, 
        password: formData.password 
      }));
      
      if (adminLogin.fulfilled.match(result)) {
        navigate('/admin/dashboard');
      }
    } else if (loginMethod === 'face' && capturedImage) {
      await handleFaceLogin();
    }
  };

  const handleFaceLogin = async () => {
    try {
      const response = await fetch('https://laravel-cc2ba.local/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          face_image: capturedImage
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('adminAuthToken', data.token);
        
        // Update Redux store state - dispatch the same fulfilled action as password login
        dispatch({
          type: adminLogin.fulfilled.type,
          payload: data
        });
        
        navigate('/admin/dashboard');
      } else {
        dispatch(clearAdminError());
        // Handle error - you might want to show this in the UI
        console.error('Face login failed:', data.message);
      }
    } catch (error) {
      console.error('Face login error:', error);
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

  const registerFace = async () => {
    if (!capturedImage) return;

    setIsRegisteringFace(true);
    try {
      const token = localStorage.getItem('adminAuthToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('https://laravel-cc2ba.local/api/admin/register-face', {
        method: 'POST',
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
        alert('Face registered successfully!');
        setCapturedImage(null);
        setIsCapturing(false);
      } else {
        alert('Face registration failed: ' + data.message);
      }
    } catch (error) {
      console.error('Face registration error:', error);
      alert('Face registration failed. Please try again.');
    } finally {
      setIsRegisteringFace(false);
    }
  };

  const videoConstraints = {
    width: 400,
    height: 300,
    facingMode: "user"
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | React App</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Access the admin panel
            </p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('face')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'face'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Face Login
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              {loginMethod === 'password' && (
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {loginMethod === 'face' && (
              <div className="space-y-4">
                {!isCapturing && !capturedImage && (
                  <button
                    type="button"
                    onClick={() => setIsCapturing(true)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start Camera
                  </button>
                )}

                {isCapturing && (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
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
                    <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
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
                        onClick={registerFace}
                        disabled={isRegisteringFace}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {isRegisteringFace ? 'Registering...' : 'Register Face'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || (loginMethod === 'face' && !capturedImage)}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : `Sign in to Admin Panel${loginMethod === 'face' ? ' with Face' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLogin; 