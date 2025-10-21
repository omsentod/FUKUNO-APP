<?php

use App\Http\Controllers\PekerjaansController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatusController;
use Illuminate\Support\Facades\Route;

// Rute utama
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// PAGE ROUTE
Route::get('/login', function () {
    return view('login');
})->name('login');

Route::get('/addtask', function () {
    return view('addtask');
})->name('addtask');

Route::get('/register', function () {
    return view('regis');
})->name('regis');

// Rute untuk dashboard dengan middleware auth
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth')->name('dashboard');

Route::get('/task', function () {
    return view('task-sb');
})->name('task');

// Rute untuk pekerjaan
Route::middleware('auth')->group(function () {
    Route::get('/workline', [PekerjaansController::class, 'index'])->name('workline');
    Route::post('/pekerjaan', [PekerjaansController::class, 'store'])->name('pekerjaan.store');
    Route::put('/pekerjaan/{id}', [PekerjaansController::class, 'update'])->name('pekerjaan.update');
    Route::delete('/pekerjaan/{id}', [PekerjaansController::class, 'destroy'])->name('pekerjaan.destroy');
});


Route::get('/status', function () {
    return view('status-sb');
})->name('status');
Route::get('/status/all', [StatusController::class, 'getAll'])->name('status.all');
Route::post('/status/store', [StatusController::class, 'store'])->name('status.store');
Route::put('/status/update/{id}', [StatusController::class, 'update'])->name('status.update');
Route::delete('/status/delete/{id}', [StatusController::class, 'destroy'])->name('status.destroy');

Route::get('/checklist', function () {
    return view('checklist-sb');
})->name('checklist');

Route::get('/user', function () {
    return view('user-sb');
})->name('user');

Route::get('/archive', function () {
    return view('archive-sb');
})->name('archive');

Route::get('/trash', function () {
    return view('trash-sb');
})->name('trash');

// MIDDLEWARE
Route::middleware('auth')->get('/user-name', [AuthController::class, 'getUserName']);

// Logout Route
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

// Rute untuk proses register (POST)
Route::post('/register', [AuthController::class, 'register'])->name('register.post');

// Rute untuk proses login (POST)
Route::post('/', [AuthController::class, 'login'])->name('login.submit');