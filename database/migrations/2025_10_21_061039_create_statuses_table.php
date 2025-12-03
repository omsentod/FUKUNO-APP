<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{

    public function up(): void
    {
        // 2. Membuat Struktur Tabel
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

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

            [
                'name' => 'Delivered', 
                'created_at' => now(), 
                'updated_at' => now()
            ],
        ]);
    }


    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};