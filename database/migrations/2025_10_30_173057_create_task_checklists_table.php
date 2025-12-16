<?php

// CHECKLIST (INSTANCE) TASK

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_pekerjaan_id')->constrained('task_pekerjaans')->onDelete('cascade');
            
           
            $table->string('nama_checklist');
            $table->boolean('is_completed')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_checklists');
    }
};
