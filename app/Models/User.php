<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'password',
    ];

    /**
     * Accessor untuk mendapatkan inisial nama.
     * (Akan dipanggil sebagai: $user->initials)
     */
    protected function initials(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $name = $attributes['name'] ?? '';
                $words = explode(' ', $name);
                $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
                return $initials ?: '??';
            }
        );
    }

    /**
     * Accessor untuk mendapatkan warna avatar HSL.
     * (Akan dipanggil sebagai: $user->avatar_color)
     */
    protected function avatarColor(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $name = $attributes['name'] ?? 'A';
                $firstLetter = strtoupper(substr($name, 0, 1));
                $letterValue = ord($firstLetter) - ord('A'); // 0-25
                $hue = ($letterValue * 14) % 360; // Hitung Hue
                return "hsl({$hue}, 65%, 40%)"; // Format HSL
            }
        );
    }
    
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function comments(): HasMany
{
    return $this->hasMany(Comment::class);
}
}
