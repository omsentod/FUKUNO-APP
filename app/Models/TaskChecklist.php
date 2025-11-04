<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChecklist extends Model
{
    use HasFactory;

    protected $table = 'task_checklists';

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = [
        'task_pekerjaan_id',
        'nama_checklist', // Jika pakai FK, ganti ini jadi 'checklist_id'
        'is_completed',
    ];

    /**
     * Relasi: Checklist ini milik satu TaskPekerjaan.
     */
    public function taskPekerjaan(): BelongsTo
    {
        return $this->belongsTo(TaskPekerjaan::class);
    }
}