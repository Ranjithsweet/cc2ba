<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            $dashboardData = [
                'user' => $user->load('role'),
                'welcome_message' => 'Welcome to your customer dashboard!',
                'recent_activity' => [
                    'last_login' => $user->updated_at,
                    'account_created' => $user->created_at,
                ]
            ];

            return response()->json([
                'data' => $dashboardData,
                'message' => 'Customer dashboard data retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function profile(Request $request)
    {
        try {
            $user = $request->user()->load('role');

            return response()->json([
                'user' => $user,
                'message' => 'Profile retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $request->user()->id,
            ]);

            $user = $request->user();
            $user->update($request->only(['name', 'email']));

            return response()->json([
                'user' => $user->load('role'),
                'message' => 'Profile updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
