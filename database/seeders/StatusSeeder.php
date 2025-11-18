<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // <-- 1. Import DB

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 2. Tambahkan kode untuk mengisi tabel
        DB::table('statuses')->insert([
            [
                'name' => 'Needs Work', // Ini akan menjadi ID = 1
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress', // Ini akan menjadi ID = 2
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hold', // Ini akan menjadi ID = 3
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done and Ready', // Ini akan menjadi ID = 4
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}