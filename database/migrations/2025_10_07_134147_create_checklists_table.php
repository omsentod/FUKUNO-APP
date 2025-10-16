<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklists', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_line_id')->constrained('pekerjaans')->onDelete('cascade');
    $table->string('nama_item');
    $table->boolean('selesai')->default(false);
    $table->timestamps();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('checklists');
    }
};
