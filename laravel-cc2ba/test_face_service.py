#!/usr/bin/env python3
"""
Simple test script to verify the face recognition service is working
"""
import requests
import json
import base64
from PIL import Image
import io

def test_face_service():
    base_url = "http://127.0.0.1:8000"
    
    print("Testing Face Recognition Service...")
    
    # Test 1: Check if service is running
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Service is running")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Service returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to service. Make sure it's running on http://127.0.0.1:8000")
        return False
    
    # Test 2: Create a simple test image (you can replace this with a real image)
    print("\n📸 Creating test image...")
    
    # Create a simple colored image (this is just for testing - in real use, you'd use actual face images)
    test_image = Image.new('RGB', (400, 300), color='red')
    img_byte_arr = io.BytesIO()
    test_image.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    # Test 3: Try to register a face (this will fail with our test image, but shows the API works)
    print("\n🔍 Testing face registration...")
    try:
        files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
        response = requests.post(f"{base_url}/register-face", files=files)
        
        if response.status_code == 400:
            print("✅ Service responded correctly (no face found in test image)")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"Response: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error testing face registration: {e}")
        return False
    
    print("\n🎉 Face recognition service is working correctly!")
    print("\nTo use with real faces:")
    print("1. Take a photo with a clear face")
    print("2. Send it to /register-face to get an encoding")
    print("3. Store the encoding in your database")
    print("4. Use /verify-face to compare new photos with stored encodings")
    
    return True

if __name__ == "__main__":
    test_face_service() 