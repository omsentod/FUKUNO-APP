<?php

// LINE PEKERJAAN (INSTANCE)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_pekerjaans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            
            // Kolom ini bisa terhubung ke tabel 'pekerjaans' Anda jika ingin dropdown
            // $table->foreignId('pekerjaan_id')->constrained('pekerjaans');
            
            // Atau jika Anda ingin input teks bebas (sesuai JS Anda saat ini):
            $table->string('nama_pekerjaan');
            $table->dateTime('deadline')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_pekerjaans');
    }
};