# Face Recognition Service

This is a Python FastAPI service that provides face recognition capabilities for the Laravel admin login system.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd python_face_service
pip install -r requirements.txt
```

### 2. Start the Service

```bash
python start_service.py
```

Or alternatively:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Verify the Service is Running

- Open your browser and go to: http://127.0.0.1:8000
- You should see: `{"message": "Face Recognition Service is running!"}`
- API Documentation: http://127.0.0.1:8000/docs

## API Endpoints

### 1. Register Face
- **URL**: `POST /register-face`
- **Purpose**: Register a new face and get its encoding
- **Input**: Image file
- **Output**: Face encoding (to be stored in Laravel database)

### 2. Verify Face
- **URL**: `POST /verify-face`
- **Purpose**: Compare a face with a stored encoding
- **Input**: Image file + stored face encoding
- **Output**: Match result (true/false) with confidence score

## How Laravel Uses This Service

1. **Admin Registration**: When an admin registers their face, Laravel sends the image to `/register-face` and stores the returned encoding in the `users.face_data` column.

2. **Admin Login**: When an admin logs in with face recognition, Laravel sends the login image and stored encoding to `/verify-face` and checks if the result is a match.

## Troubleshooting

- **No face found**: Make sure the image contains a clear, front-facing face
- **Multiple faces**: Upload an image with only one face
- **Service not starting**: Check if port 8000 is available
- **Import errors**: Make sure all dependencies are installed with `pip install -r requirements.txt` 