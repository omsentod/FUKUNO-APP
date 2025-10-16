<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->string('no_invoice')->nullable();
    $table->string('nama_pelanggan');
    $table->string('judul');
    $table->text('catatan')->nullable();
    $table->foreignId('penanggung_jawab')->nullable()->constrained('users')->onDelete('set null');
    $table->enum('urgensi', ['rendah', 'sedang', 'tinggi'])->nullable();
    $table->integer('jumlah')->nullable();
    $table->json('jenis_size')->nullable();
    $table->string('warna')->nullable();
    $table->string('model')->nullable();
    $table->string('bahan')->nullable();
    $table->string('mockup')->nullable(); // path upload
    $table->timestamps();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
