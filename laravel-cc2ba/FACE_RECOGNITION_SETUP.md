# Face Recognition Login Setup Guide

This guide will help you set up face recognition login for the admin panel.

## Prerequisites

- Python 3.8+ installed
- Laravel project running
- React frontend running

## Step 1: Install Python Dependencies

```bash
cd python_face_service
python3 -m pip install -r requirements.txt
```

**Note**: The `face_recognition` library requires some system dependencies. On macOS, you might need to install additional packages:

```bash
# On macOS with Homebrew
brew install cmake
brew install dlib
```

## Step 2: Start the Python Face Recognition Service

```bash
cd python_face_service
python3 start_service.py
```

You should see output like:
```
Starting Face Recognition Service...
Service will be available at: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/docs
Press Ctrl+C to stop the service
```

## Step 3: Test the Python Service

```bash
python3 test_face_service.py
```

This will verify that the service is running correctly.

## Step 4: Install React Dependencies

```bash
cd ../react-cc2ba
npm install react-webcam
```

## Step 5: Start Your Applications

### Terminal 1: Python Service
```bash
cd laravel-cc2ba/python_face_service
python3 start_service.py
```

### Terminal 2: Laravel Backend
```bash
cd laravel-cc2ba
php artisan serve
```

### Terminal 3: React Frontend
```bash
cd react-cc2ba
npm start
```

## Step 6: Test Face Recognition Login

1. **Access Admin Login**: Go to `http://localhost:3000/admin/login`

2. **Switch to Face Login**: Click the "Face Login" button

3. **Register Face** (First Time):
   - Login with password first
   - Go to admin dashboard
   - Use the "Register Face" functionality to capture and store your face

4. **Login with Face**:
   - Go back to admin login
   - Switch to "Face Login"
   - Enter your email
   - Capture your face
   - Click "Sign in to Admin Panel with Face"

## API Endpoints

### Python Service (http://127.0.0.1:8000)
- `GET /` - Check if service is running
- `POST /register-face` - Register a new face
- `POST /verify-face` - Verify a face against stored encoding

### Laravel API (http://localhost:8000/api)
- `POST /admin/login` - Admin login (supports both password and face)
- `POST /admin/register-face` - Register face for admin (requires auth)

## Troubleshooting

### Python Service Issues

1. **Import Error for face_recognition**:
   ```bash
   # On macOS
   brew install cmake dlib
   pip3 install face_recognition
   ```

2. **Service won't start**:
   - Check if port 8000 is available
   - Try a different port in `start_service.py`

3. **No face detected**:
   - Ensure the image contains a clear, front-facing face
   - Good lighting conditions
   - No multiple faces in the image

### Laravel Issues

1. **Face recognition service unavailable**:
   - Make sure Python service is running on http://127.0.0.1:8000
   - Check Laravel logs: `tail -f storage/logs/laravel.log`

2. **Database migration issues**:
   ```bash
   php artisan migrate:status
   php artisan migrate
   ```

### React Issues

1. **Webcam not working**:
   - Ensure HTTPS or localhost (webcam requires secure context)
   - Check browser permissions for camera access

2. **Face login not working**:
   - Check browser console for errors
   - Verify API endpoints are correct
   - Ensure face is properly registered first

## Security Considerations

1. **Face Data Storage**: Face encodings are stored as JSON in the database. Consider encryption for production.

2. **Image Processing**: Images are temporarily stored during processing. Ensure proper cleanup.

3. **Service Communication**: The Python service runs locally. For production, consider:
   - Running on a separate server
   - Using HTTPS for communication
   - Implementing proper authentication between services

## Production Deployment

1. **Python Service**: Deploy as a separate service with proper process management (systemd, supervisor, etc.)

2. **Laravel**: Update the `FaceRecognitionService` base URL to point to your production Python service

3. **React**: Build for production and serve from a web server

4. **Security**: Implement proper authentication and authorization between services

## Support

If you encounter issues:

1. Check the logs in `storage/logs/laravel.log`
2. Verify all services are running
3. Test the Python service independently
4. Check browser console for frontend errors 