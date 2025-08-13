<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get role IDs
        $adminRole = Role::where('name', 'admin')->first();
        $customerRole = Role::where('name', 'customer')->first();

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'antonyranjithkumart@gmail.com',
            'password' => Hash::make('12345678'),
            'role_id' => $adminRole->id,
        ]);

        // Create customer users
        User::create([
            'name' => 'Customer One',
            'email' => 'customer@test.com',
            'password' => Hash::make('12345678'),
            'role_id' => $customerRole->id,
        ]);

        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('12345678'),
            'role_id' => $customerRole->id,
        ]);
    }
} 