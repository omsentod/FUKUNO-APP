<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveDeadlineFromPekerjaansTable extends Migration
{
    public function up()
    {
        Schema::table('pekerjaans', function (Blueprint $table) {
            $table->dropColumn('deadline');
        });
    }

    public function down()
    {
        Schema::table('pekerjaans', function (Blueprint $table) {
            $table->date('deadline')->nullable();
        });
    }
}