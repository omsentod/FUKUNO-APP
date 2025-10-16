<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'invoice_number', 'nama_pelanggan', 'judul', 'catatan', 
        'penanggung_jawab', 'urgensi', 'jumlah', 'warna', 
        'model', 'bahan', 'mockup', 'jenis_size'
    ];

    protected $casts = [
        'mockup' => 'array',
        'jenis_size' => 'array',
    ];

    public function lines() {
        return $this->hasMany(Pekerjaan::class);
    }
}
