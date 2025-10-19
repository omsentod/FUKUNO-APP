<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Pekerjaan extends Model
{
    use HasFactory;

    // Hanya kolom 'job_name' yang bisa diisi secara massal
    protected $fillable = ['job_name'];

    // Fungsi untuk mereset ID dan memastikan urutan ID yang benar
    public static function resetIds()
    {
        $pekerjaans = self::orderBy('id')->get();
        $id = 1;

        foreach ($pekerjaans as $pekerjaan) {
            $pekerjaan->id = $id++;
            $pekerjaan->save();
        }

        DB::statement("ALTER TABLE pekerjaans AUTO_INCREMENT = $id");
    }
}
