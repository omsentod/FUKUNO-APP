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
        // Perhatikan nama tabelnya: 'task_checklists'
        Schema::table('task_checklists', function (Blueprint $table) {
            // Kita taruh setelah is_completed agar rapi
            $table->integer('position')->default(0)->after('is_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_checklists', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};