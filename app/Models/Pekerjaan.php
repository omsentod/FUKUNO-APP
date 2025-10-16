<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pekerjaan extends Model
{
    protected $fillable = ['task_id', 'nama_pekerjaan', 'deadline'];

    public function checklists() {
        return $this->hasMany(Checklist::class);
    }

    public function task() {
        return $this->belongsTo(Task::class);
    }
}
