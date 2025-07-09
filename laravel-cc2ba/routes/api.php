<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Legacy authentication routes (keeping for backward compatibility)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Admin routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth:sanctum');
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/users', [AdminDashboardController::class, 'getUsers']);
        Route::put('/users/{id}', [AdminDashboardController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminDashboardController::class, 'deleteUser']);
        Route::post('/register-face', [AdminAuthController::class, 'registerFace']);
        Route::put('/update-face', [AdminAuthController::class, 'updateFace']);
        Route::put('/profile', [AdminDashboardController::class, 'updateProfile']);
    });
});

// Customer routes
Route::prefix('customer')->group(function () {
    Route::post('/login', [CustomerAuthController::class, 'login']);
    Route::post('/logout', [CustomerAuthController::class, 'logout'])->middleware('auth:sanctum');
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/dashboard', [CustomerDashboardController::class, 'index']);
        Route::get('/profile', [CustomerDashboardController::class, 'profile']);
        Route::put('/profile', [CustomerDashboardController::class, 'updateProfile']);
    });
});

// User routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
}); 