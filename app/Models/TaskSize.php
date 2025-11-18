<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskSize extends Model
{
    use HasFactory;

    protected $table = 'task_sizes';

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = [
        'task_id',
        'jenis',
        'tipe',
        'jumlah',
    ];

    /**
     * Relasi: Entri size ini milik satu Task.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}