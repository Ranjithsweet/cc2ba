from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import numpy as np
import io
import json
from PIL import Image

app = FastAPI(title="Face Recognition Service", version="1.0.0")

# Add CORS middleware to allow requests from Laravel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Laravel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Face Recognition Service!"}

@app.post("/register-face")
async def register_face(file: UploadFile = File(...)):
    """
    Register a face by uploading an image.
    Returns a face encoding that can be stored in the database.
    """
    try:
        # Read the uploaded image
        image_bytes = await file.read()
        
        # Load image using face_recognition
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        
        # Find face encodings in the image
        encodings = face_recognition.face_encodings(image)
        
        if not encodings:
            raise HTTPException(
                status_code=400, 
                detail="No face found in the image. Please upload an image with a clear face."
            )
        
        if len(encodings) > 1:
            raise HTTPException(
                status_code=400, 
                detail="Multiple faces found in the image. Please upload an image with only one face."
            )
        
        # Return the face encoding as a list (can be stored as JSON in database)
        return {
            "success": True,
            "encoding": encodings[0].tolist(),
            "message": "Face registered successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing image: {str(e)}"
        )

@app.post("/verify-face")
async def verify_face(file: UploadFile = File(...), face_encoding: str = Form(...)):
    """
    Verify a face by comparing it with a stored encoding.
    Returns whether the faces match or not.
    """
    try:
        # Read the uploaded image
        image_bytes = await file.read()
        
        # Load image using face_recognition
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        
        # Find face encodings in the image
        encodings = face_recognition.face_encodings(image)
        
        if not encodings:
            raise HTTPException(
                status_code=400, 
                detail="No face found in the image. Please upload an image with a clear face."
            )
        
        if len(encodings) > 1:
            raise HTTPException(
                status_code=400, 
                detail="Multiple faces found in the image. Please upload an image with only one face."
            )
        
        # Parse the stored face encoding
        try:
            # If face_encoding is a JSON string, parse it
            if face_encoding.startswith('['):
                known_encoding = np.array(json.loads(face_encoding))
            else:
                # If it's already a string representation of a list
                known_encoding = np.array(eval(face_encoding))
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid face encoding format: {str(e)}"
            )
        
        # Compare the faces
        current_encoding = encodings[0]
        results = face_recognition.compare_faces([known_encoding], current_encoding, tolerance=0.6)
        
        # Calculate face distance for confidence
        face_distance = face_recognition.face_distance([known_encoding], current_encoding)[0]
        confidence = 1 - face_distance
        
        return {
            "success": True,
            "match": bool(results[0]),
            "confidence": float(confidence),
            "face_distance": float(face_distance),
            "message": "Face verification completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing image: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 