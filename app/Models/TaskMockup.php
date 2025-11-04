<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskMockup extends Model
{
    use HasFactory;

    protected $table = 'task_mockups';

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = [
        'task_id',
        'file_path',
        'order',
    ];

    /**
     * Relasi: Mockup ini milik satu Task.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}