<?php

// SIZE

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->string('jenis'); // Nama baris (e.g., "Baju Anak")
            $table->string('tipe');  // Nama kolom (e.g., "Pendek", "Panjang")
            $table->integer('jumlah'); // Nilai di sel
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_sizes');
    }
};
