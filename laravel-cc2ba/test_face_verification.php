<?php

echo "=== Face Recognition Service Test ===\n";

// Test 1: Check if service is running
echo "1. Checking if service is running...\n";
try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        echo "   ✅ Service is running\n";
        echo "   Response: " . $response . "\n";
    } else {
        echo "   ❌ Service returned HTTP code: " . $httpCode . "\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ❌ Error connecting to service: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Test face registration
echo "\n2. Testing face registration...\n";
$testImagePath = __DIR__ . '/test_face.jpg';

// Create a simple test image if it doesn't exist
if (!file_exists($testImagePath)) {
    echo "   Creating test image...\n";
    // Create a simple colored image for testing
    $image = imagecreate(100, 100);
    $red = imagecolorallocate($image, 255, 0, 0);
    imagefill($image, 0, 0, $red);
    imagejpeg($image, $testImagePath);
    imagedestroy($image);
}

try {
    // Test registration
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/register-face');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'file' => new CURLFile($testImagePath)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success']) {
            echo "   ✅ Face registration successful\n";
            echo "   Encoding length: " . count($data['encoding']) . "\n";
            
            // Test 3: Test face verification
            echo "\n3. Testing face verification...\n";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/verify-face');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, [
                'file' => new CURLFile($testImagePath),
                'face_encoding' => json_encode($data['encoding'])
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            $verifyResponse = curl_exec($ch);
            $verifyHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($verifyHttpCode === 200) {
                $verifyData = json_decode($verifyResponse, true);
                if (isset($verifyData['success']) && $verifyData['success']) {
                    echo "   ✅ Face verification successful\n";
                    echo "   Match: " . ($verifyData['match'] ? 'Yes' : 'No') . "\n";
                    echo "   Confidence: " . ($verifyData['confidence'] ?? 'N/A') . "\n";
                    echo "   Correlation: " . ($verifyData['correlation'] ?? 'N/A') . "\n";
                } else {
                    echo "   ❌ Face verification failed\n";
                    echo "   Response: " . $verifyResponse . "\n";
                }
            } else {
                echo "   ❌ Face verification HTTP error: " . $verifyHttpCode . "\n";
                echo "   Response: " . $verifyResponse . "\n";
            }
        } else {
            echo "   ❌ Face registration failed\n";
            echo "   Response: " . $response . "\n";
        }
    } else {
        echo "   ❌ Face registration HTTP error: " . $httpCode . "\n";
        echo "   Response: " . $response . "\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// Clean up
if (file_exists($testImagePath)) {
    unlink($testImagePath);
}

echo "\n=== Test Complete ===\n"; 