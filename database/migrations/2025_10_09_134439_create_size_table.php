<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('task_sizes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
    $table->string('jenis_size')->nullable();
    $table->string('size')->nullable();
    $table->string('jumlah')->nullable(); // disimpan string biar bisa isi "10 Pcs", "5 Set", dll
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size');
    }
};
