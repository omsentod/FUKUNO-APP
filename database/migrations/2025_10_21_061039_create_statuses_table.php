<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 2. Membuat Struktur Tabel
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // 3. LANGSUNG ISI DATA DI SINI
        // Kita pakai DB::table karena Model mungkin belum siap saat migrasi jalan
        DB::table('statuses')->insert([
            [
                'name' => 'Needs Work', 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'name' => 'In Progress', 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'name' => 'Hold', 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'name' => 'Done and Ready', 
                'created_at' => now(), 
                'updated_at' => now()
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};