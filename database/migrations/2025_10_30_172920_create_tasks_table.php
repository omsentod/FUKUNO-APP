<?php

// TASK

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users'); // PIC (dari tabel users Anda)
            $table->foreignId('status_id')->default(1)->constrained('statuses'); // Status (dari tabel statuses Anda)
            
            $table->string('no_invoice');
            $table->string('nama_pelanggan');
            $table->string('judul');
            $table->text('catatan')->nullable();
            $table->string('urgensi');
            $table->integer('total_jumlah')->default(0); // Grand total dari tabel size
            $table->string('warna')->nullable();
            $table->string('model')->nullable();
            $table->string('bahan')->nullable();
            $table->text('bahan_terpakai')->nullable();
            $table->text('bahan_reject')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};