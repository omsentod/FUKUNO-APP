<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePekerjaansTable extends Migration
{
    public function up()
    {
        Schema::create('pekerjaans', function (Blueprint $table) {
            $table->id();
            $table->string('job_name');  // hanya job_name yang ada
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pekerjaans');
    }
}
