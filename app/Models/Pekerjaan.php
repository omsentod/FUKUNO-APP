<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Pekerjaan extends Model
{
    use HasFactory;

    protected $fillable = ['nama_pekerjaan', 'deadline'];

    // Reset auto increment dan reindex ID setelah delete
    public static function resetIds()
    {
        $pekerjaans = self::orderBy('id')->get();
        $id = 1;

        foreach ($pekerjaans as $p) {
            $p->id = $id++;
            $p->save();
        }

        // Reset auto increment ke ID terakhir + 1
        DB::statement("ALTER TABLE pekerjaans AUTO_INCREMENT = $id");
    }
}
