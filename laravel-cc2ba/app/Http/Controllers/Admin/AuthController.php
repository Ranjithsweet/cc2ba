<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\FaceRecognitionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $faceRecognitionService;

    public function __construct(FaceRecognitionService $faceRecognitionService)
    {
        $this->faceRecognitionService = $faceRecognitionService;
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required_without:face_image',
                'face_image' => 'required_without:password|string',
            ]);

            $user = User::where('email', $request->email)->with('role')->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Invalid credentials',
                    'errors' => [
                        'email' => ['The provided credentials are incorrect.']
                    ]
                ], 401);
            }

            // Check if user is admin
            if (!$user->isAdmin()) {
                return response()->json([
                    'message' => 'Access denied',
                    'errors' => [
                        'email' => ['This login is only for administrators.']
                    ]
                ], 403);
            }

            // Handle face login
            if ($request->has('face_image') && !$request->has('password')) {
                return $this->handleFaceLogin($request, $user);
            }

            // Handle password login
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                    'errors' => [
                        'email' => ['The provided credentials are incorrect.']
                    ]
                ], 401);
            }

            // Create Sanctum token
            $token = $user->createToken('admin-auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Admin login successful'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    protected function handleFaceLogin(Request $request, User $user)
    {
        try {
            // Check if user has face data
            if (!$user->face_data) {
                return response()->json([
                    'message' => 'Face recognition not set up',
                    'errors' => [
                        'face_image' => ['Face recognition has not been set up for this account. Please use password login.']
                    ]
                ], 400);
            }

            // Check if face recognition service is running
            if (!$this->faceRecognitionService->isServiceRunning()) {
                return response()->json([
                    'message' => 'Face recognition service unavailable',
                    'errors' => [
                        'face_image' => ['Face recognition service is currently unavailable. Please try again later.']
                    ]
                ], 503);
            }

            // Decode base64 image
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->face_image));
            if (!$imageData) {
                return response()->json([
                    'message' => 'Invalid image format',
                    'errors' => [
                        'face_image' => ['Invalid image format. Please try again.']
                    ]
                ], 400);
            }

            // Save temporary image
            $tempPath = storage_path('app/temp/' . uniqid() . '.jpg');
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            file_put_contents($tempPath, $imageData);

            // Verify face
            $result = $this->faceRecognitionService->verifyFace($tempPath, $user->face_data);

            // Clean up temporary file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            if (!$result) {
                return response()->json([
                    'message' => 'Face verification failed',
                    'errors' => [
                        'face_image' => ['Face verification failed. Please try again.']
                    ]
                ], 400);
            }

            if (!$result['match']) {
                return response()->json([
                    'message' => 'Face not recognized',
                    'errors' => [
                        'face_image' => ['Face not recognized. Please try again or use password login.']
                    ]
                ], 401);
            }

            // Create Sanctum token
            $token = $user->createToken('admin-auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'confidence' => $result['confidence'],
                'message' => 'Admin login successful with face recognition'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during face login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function registerFace(Request $request)
    {
        try {
            $request->validate([
                'face_image' => 'required|string',
            ]);

            $user = $request->user();

            if (!$user->isAdmin()) {
                return response()->json([
                    'message' => 'Access denied',
                    'errors' => [
                        'face_image' => ['Only administrators can register face data.']
                    ]
                ], 403);
            }

            // Check if face recognition service is running
            if (!$this->faceRecognitionService->isServiceRunning()) {
                return response()->json([
                    'message' => 'Face recognition service unavailable',
                    'errors' => [
                        'face_image' => ['Face recognition service is currently unavailable. Please try again later.']
                    ]
                ], 503);
            }

            // Decode base64 image
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->face_image));
            if (!$imageData) {
                return response()->json([
                    'message' => 'Invalid image format',
                    'errors' => [
                        'face_image' => ['Invalid image format. Please try again.']
                    ]
                ], 400);
            }

            // Save temporary image
            $tempPath = storage_path('app/temp/' . uniqid() . '.jpg');
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            file_put_contents($tempPath, $imageData);

            // Register face
            $encoding = $this->faceRecognitionService->registerFace($tempPath);

            // Clean up temporary file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            if (!$encoding) {
                return response()->json([
                    'message' => 'Face registration failed',
                    'errors' => [
                        'face_image' => ['Face registration failed. Please ensure the image contains a clear face and try again.']
                    ]
                ], 400);
            }

            // Save face encoding to user
            $user->update(['face_data' => json_encode($encoding)]);

            return response()->json([
                'message' => 'Face registered successfully',
                'user' => $user->fresh()
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during face registration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateFace(Request $request)
    {
        try {
            $request->validate([
                'face_image' => 'required|string',
            ]);

            $user = $request->user();

            if (!$user->isAdmin()) {
                return response()->json([
                    'message' => 'Access denied',
                    'errors' => [
                        'face_image' => ['Only administrators can update face data.']
                    ]
                ], 403);
            }

            // Check if face recognition service is running
            if (!$this->faceRecognitionService->isServiceRunning()) {
                return response()->json([
                    'message' => 'Face recognition service unavailable',
                    'errors' => [
                        'face_image' => ['Face recognition service is currently unavailable. Please try again later.']
                    ]
                ], 503);
            }

            // Decode base64 image
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->face_image));
            if (!$imageData) {
                return response()->json([
                    'message' => 'Invalid image format',
                    'errors' => [
                        'face_image' => ['Invalid image format. Please try again.']
                    ]
                ], 400);
            }

            // Save temporary image
            $tempPath = storage_path('app/temp/' . uniqid() . '.jpg');
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            file_put_contents($tempPath, $imageData);

            // Register new face
            $encoding = $this->faceRecognitionService->registerFace($tempPath);

            // Clean up temporary file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            if (!$encoding) {
                return response()->json([
                    'message' => 'Face update failed',
                    'errors' => [
                        'face_image' => ['Face update failed. Please ensure the image contains a clear face and try again.']
                    ]
                ], 400);
            }

            // Update face encoding for user
            $user->update(['face_data' => json_encode($encoding)]);

            return response()->json([
                'message' => 'Face data updated successfully',
                'user' => $user->fresh()
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during face update',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            // Delete the current token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Admin logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
