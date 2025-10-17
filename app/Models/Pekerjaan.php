<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Pekerjaan extends Model
{
    use HasFactory;

    protected $fillable = ['nama_pekerjaan'];

    // Fungsi untuk mereset ID dan memastikan urutan ID yang benar
    public static function resetIds()
    {
        // Ambil semua pekerjaan yang terurut berdasarkan ID
        $pekerjaans = self::orderBy('id')->get();
        $id = 1;

        // Loop untuk setiap pekerjaan dan reset ID
        foreach ($pekerjaans as $pekerjaan) {
            $pekerjaan->id = $id++;  // Atur ulang ID secara berurutan
            $pekerjaan->save();  // Simpan perubahan
        }

        // Mengubah AUTO_INCREMENT sesuai ID terakhir yang ada
        // Pastikan $id adalah ID terakhir + 1 agar tidak ada duplikasi ID
        DB::statement("ALTER TABLE pekerjaans AUTO_INCREMENT = $id");
    }
}
