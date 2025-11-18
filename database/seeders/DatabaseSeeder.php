<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // ▼▼▼ TAMBAHKAN PEMANGGILAN INI ▼▼▼
        // Ini akan menjalankan StatusSeeder Anda dan mengisi tabel 'statuses'
        $this->call([
            StatusSeeder::class,
            // (Anda juga bisa menambahkan PekerjaanSeeder, ChecklistSeeder, dll. di sini)
        ]);
        // ▲▲▲ AKHIR TAMBAHAN ▲▲▲
    }
}