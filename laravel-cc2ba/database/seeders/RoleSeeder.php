<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create([
            'name' => 'admin',
            'description' => 'Administrator with full access to the system',
        ]);

        Role::create([
            'name' => 'customer',
            'description' => 'Regular customer with limited access',
        ]);
    }
}
