<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
    Schema::create('pekerjaans', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
    $table->string('nama_pekerjaan');
    $table->date('deadline')->nullable();
    $table->timestamps();
});
    }

    public function down(): void {
        Schema::dropIfExists('pekerjaans');
    }
};
