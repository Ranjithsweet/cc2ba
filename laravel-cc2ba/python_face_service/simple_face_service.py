#!/usr/bin/env python3
"""
Simplified Face Recognition Service
This version uses basic image processing instead of complex ML libraries
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import io
import hashlib
import json
from PIL import Image
import numpy as np

app = FastAPI(title="Simple Face Recognition Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Simple Face Recognition Service!"}

def process_image(image_bytes):
    """Process image and extract basic features"""
    try:
        # Load image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to grayscale
        gray_image = image.convert('L')
        
        # Resize to standard size
        gray_image = gray_image.resize((100, 100))
        
        # Convert to numpy array
        img_array = np.array(gray_image)
        
        # Normalize
        img_array = img_array / 255.0
        
        # Create a simple feature vector (flattened array)
        features = img_array.flatten().tolist()
        
        # Create a hash for comparison
        feature_hash = hashlib.md5(str(features).encode()).hexdigest()
        
        return {
            "features": features,
            "hash": feature_hash,
            "shape": img_array.shape
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.post("/register-face")
async def register_face(file: UploadFile = File(...)):
    """
    Register a face by uploading an image.
    Returns a face encoding that can be stored in the database.
    """
    try:
        # Read the uploaded image
        image_bytes = await file.read()
        
        # Process the image
        result = process_image(image_bytes)
        
        return {
            "success": True,
            "encoding": result["features"],
            "hash": result["hash"],
            "message": "Face registered successfully (simplified version)"
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
        
        # Process the current image
        current_result = process_image(image_bytes)
        
        # Parse the stored face encoding
        try:
            stored_features = json.loads(face_encoding)
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid face encoding format: {str(e)}"
            )
        
        # Compare features using simple correlation
        current_features = np.array(current_result["features"])
        stored_features = np.array(stored_features)
        
        # Calculate correlation coefficient
        correlation = np.corrcoef(current_features, stored_features)[0, 1]
        
        # Simple threshold-based matching
        threshold = 0.65  # Lowered threshold for more practical face recognition
        is_match = correlation > threshold if not np.isnan(correlation) else False
        
        # Calculate confidence
        confidence = max(0, min(1, correlation)) if not np.isnan(correlation) else 0
        
        return {
            "success": True,
            "match": bool(is_match),
            "confidence": float(confidence),
            "correlation": float(correlation) if not np.isnan(correlation) else 0,
            "message": "Face verification completed (simplified version)"
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
    print("Starting Simple Face Recognition Service...")
    print("Service will be available at: http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("Press Ctrl+C to stop the service")
    
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8000,
        reload=True,
        log_level="info"
    ) 