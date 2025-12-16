<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    use HasFactory;

    // Tambahkan 'position' di sini agar bisa disimpan
    protected $fillable = [
        'name', 
        'position' 
    ]; 

    public function items()
    {
        return $this->hasMany(ChecklistItem::class);
    }
}