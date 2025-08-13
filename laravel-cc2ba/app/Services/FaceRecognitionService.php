<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FaceRecognitionService
{
    private $baseUrl = 'http://127.0.0.1:8000';

    /**
     * Register a face by sending image to Python service
     *
     * @param string $imagePath Path to the image file
     * @return array|null Returns face encoding or null if failed
     */
    public function registerFace($imagePath)
    {
        try {
            if (!file_exists($imagePath)) {
                throw new Exception("Image file not found: {$imagePath}");
            }

            $response = Http::timeout(30)->attach(
                'file',
                file_get_contents($imagePath),
                basename($imagePath)
            )->post($this->baseUrl . '/register-face');

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['success']) && $data['success']) {
                    return $data['encoding'];
                }
            }

            if (class_exists('Illuminate\Support\Facades\Log')) {
                Log::error('Face registration failed', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
            }

            return null;

        } catch (Exception $e) {
            if (class_exists('Illuminate\Support\Facades\Log')) {
                Log::error('Face registration error', [
                    'error' => $e->getMessage(),
                    'image_path' => $imagePath
                ]);
            }
            return null;
        }
    }

    /**
     * Verify a face by comparing with stored encoding
     *
     * @param string $imagePath Path to the login image
     * @param string $storedEncoding JSON string of stored face encoding
     * @return array|null Returns verification result or null if failed
     */
    public function verifyFace($imagePath, $storedEncoding)
    {
        try {
            if (!file_exists($imagePath)) {
                throw new Exception("Image file not found: {$imagePath}");
            }

            $response = Http::timeout(30)->attach(
                'file',
                file_get_contents($imagePath),
                basename($imagePath)
            )->post($this->baseUrl . '/verify-face', [
                'face_encoding' => $storedEncoding
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['success']) && $data['success']) {
                    return [
                        'match' => $data['match'],
                        'confidence' => $data['confidence'] ?? 0,
                        'face_distance' => $data['face_distance'] ?? 0
                    ];
                }
            }

            if (class_exists('Illuminate\Support\Facades\Log')) {
                Log::error('Face verification failed', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
            }

            return null;

        } catch (Exception $e) {
            if (class_exists('Illuminate\Support\Facades\Log')) {
                Log::error('Face verification error', [
                    'error' => $e->getMessage(),
                    'image_path' => $imagePath
                ]);
            }
            return null;
        }
    }

    /**
     * Check if the Python service is running
     *
     * @return bool
     */
    public function isServiceRunning()
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl . '/');
            return $response->successful();
        } catch (Exception $e) {
            // Only log if Laravel is available
            if (class_exists('Illuminate\Support\Facades\Log')) {
                Log::warning('Face recognition service not available', [
                    'error' => $e->getMessage()
                ]);
            }
            return false;
        }
    }
} 