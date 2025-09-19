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
            $table->string('no_invoice')->unique(); // Nomor invoice unik
            $table->string('nama_pelanggan');
            $table->string('judul_task');
            $table->date('start_date');
            $table->enum('urgent', ['High', 'Medium', 'Low'])->default('Medium');
            $table->string('mockup_link')->nullable();
            $table->string('penanggung_jawab'); // Bisa foreign key ke users jika perlu
            $table->integer('jumlah');
            $table->string('jenis_pekerjaan');
            $table->foreignId('line_pekerjaan_id')->constrained('pekerjaans')->onDelete('cascade'); // Foreign key ke pekerjaans
            $table->date('deadline');
            $table->text('note')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Asumsi task dibuat oleh user (dari Sanctum)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
