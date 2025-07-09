<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->with('role')->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                    'errors' => [
                        'email' => ['The provided credentials are incorrect.']
                    ]
                ], 401);
            }

            // Check if user is customer
            if (!$user->isCustomer()) {
                return response()->json([
                    'message' => 'Access denied',
                    'errors' => [
                        'email' => ['This login is only for customers.']
                    ]
                ], 403);
            }

            // Create Sanctum token
            $token = $user->createToken('customer-auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Customer login successful'
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

    public function logout(Request $request)
    {
        try {
            // Delete the current token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Customer logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
