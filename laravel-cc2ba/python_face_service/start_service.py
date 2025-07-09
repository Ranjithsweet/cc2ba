#!/usr/bin/env python3
"""
Simple script to start the Face Recognition Service
"""
import uvicorn

if __name__ == "__main__":
    print("Starting Simple Face Recognition Service...")
    print("Service will be available at: http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("Press Ctrl+C to stop the service")
    
    uvicorn.run(
        "simple_face_service:app", 
        host="127.0.0.1", 
        port=8000,
        reload=True,
        log_level="info"
    ) 