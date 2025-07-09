<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_customers' => User::whereHas('role', function($query) {
                    $query->where('name', 'customer');
                })->count(),
                'total_admins' => User::whereHas('role', function($query) {
                    $query->where('name', 'admin');
                })->count(),
            ];

            return response()->json([
                'stats' => $stats,
                'message' => 'Admin dashboard data retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsers()
    {
        try {
            $users = User::with('role')->get();

            return response()->json([
                'users' => $users,
                'message' => 'Users retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateUser(Request $request, $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id,
                'role_id' => 'required|exists:roles,id',
            ]);

            $user = User::findOrFail($id);
            $user->update($request->only(['name', 'email', 'role_id']));

            return response()->json([
                'user' => $user->load('role'),
                'message' => 'User updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting user',
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
