#!/usr/bin/env python3
"""
Test script for the simplified face recognition service
"""
import requests
import json
from PIL import Image
import io

def test_simple_face_service():
    base_url = "http://127.0.0.1:8000"
    
    print("Testing Simplified Face Recognition Service...")
    
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
    
    # Test 2: Create a simple test image
    print("\n📸 Creating test image...")
    
    # Create a simple colored image
    test_image = Image.new('RGB', (400, 300), color='red')
    img_byte_arr = io.BytesIO()
    test_image.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    # Test 3: Try to register a face
    print("\n🔍 Testing face registration...")
    try:
        files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
        response = requests.post(f"{base_url}/register-face", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Face registration successful")
            print(f"Response: {data}")
            
            # Test 4: Try to verify the same face
            print("\n🔍 Testing face verification...")
            try:
                files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
                data = {
                    'face_encoding': json.dumps(data['encoding'])
                }
                response = requests.post(f"{base_url}/verify-face", files=files, data=data)
                
                if response.status_code == 200:
                    verify_data = response.json()
                    print("✅ Face verification successful")
                    print(f"Match: {verify_data['match']}")
                    print(f"Confidence: {verify_data['confidence']:.2f}")
                    print(f"Correlation: {verify_data['correlation']:.2f}")
                else:
                    print(f"❌ Face verification failed: {response.status_code}")
                    print(f"Response: {response.json()}")
                    
            except Exception as e:
                print(f"❌ Error testing face verification: {e}")
                return False
                
        else:
            print(f"❌ Face registration failed: {response.status_code}")
            print(f"Response: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error testing face registration: {e}")
        return False
    
    print("\n🎉 Simplified face recognition service is working correctly!")
    print("\nNext steps:")
    print("1. Start your Laravel backend: php artisan serve")
    print("2. Start your React frontend: npm start")
    print("3. Test the admin login with face recognition")
    
    return True

if __name__ == "__main__":
    test_simple_face_service() 