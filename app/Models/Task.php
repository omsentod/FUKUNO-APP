<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory,SoftDeletes ;

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = [
        'user_id',
        'status_id',
        'no_invoice',
        'nama_pelanggan',
        'judul',
        'catatan',
        'urgensi',
        'total_jumlah',
        'warna',
        'model',
        'bahan',
<<<<<<< HEAD
=======
        'size_title',
        'bahan_terpakai',
        'bahan_reject',
>>>>>>> task
    ];

    /**
     * Relasi: Task ini milik satu User (PIC).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: Task ini milik satu Status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    /**
     * Relasi: Task ini memiliki banyak TaskPekerjaan.
     * (Nama TaskLine/TaskPekerjaan harus konsisten)
     */
    public function taskPekerjaans(): HasMany
    {
        // Ganti 'TaskPekerjaan' jika nama model Anda berbeda
        return $this->hasMany(TaskPekerjaan::class); 
    }

    /**
     * Relasi: Task ini memiliki banyak TaskSize.
     */
    public function taskSizes(): HasMany
    {
        return $this->hasMany(TaskSize::class);
    }

    /**
     * Relasi: Task ini memiliki banyak TaskMockup.
     */
    public function mockups(): HasMany
    {
        return $this->hasMany(TaskMockup::class);
    }

    public function comments(): HasMany
{
    return $this->hasMany(Comment::class);
}
}