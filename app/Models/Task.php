<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_invoice', 'nama_pelanggan', 'judul_task', 'start_date', 'urgent',
        'mockup_link', 'penanggung_jawab', 'jumlah', 'jenis_pekerjaan',
        'line_pekerjaan_id', 'deadline', 'note', 'user_id'
    ];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'line_pekerjaan_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
