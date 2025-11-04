<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; // <-- TAMBAHKAN BARIS INI
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskPekerjaan extends Model // <-- Baris ini sekarang sudah benar
{
    use HasFactory;

    protected $table = 'task_pekerjaans'; 

    protected $fillable = [
        'task_id',
        'nama_pekerjaan',
        'deadline',
    ];

    /**
     * Relasi: Line pekerjaan ini milik satu Task.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Relasi: Line pekerjaan ini memiliki banyak TaskChecklist.
     */
    public function checklists(): HasMany
    {
        return $this->hasMany(TaskChecklist::class, 'task_pekerjaan_id'); 
    }
}