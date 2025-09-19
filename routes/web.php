<?php
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('login');
})->name('login');

Route::get('/register', function () {
    return view('regis');
})->name('regis');

// Dashboard
Route::get('/dashboard', function () {
    return view('dashboard'); // buat file resources/views/dashboard.blade.php
})->name('dashboard');

Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard')->middleware('auth');

// Logout
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');
Route::post('/', [AuthController::class, 'login'])->name('login.submit');
