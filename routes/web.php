<?php
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PekerjaansController;

// PAGE ROUTE
Route::get('/login', function () {
    return view('login');
})->name('login');

Route::get('/register', function () {
    return view('regis');
})->name('regis');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth'])->name('dashboard');

Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard')->middleware('auth');

Route::get('/task', function () {
    return view('task-sb');
})->name('task');



// routes/web.php
Route::get('/workline', [PekerjaansController::class, 'index'])->name('workline');
Route::post('/workline', [PekerjaansController::class, 'store'])->name('pekerjaan.store');
Route::put('/workline/{id}', [PekerjaansController::class, 'update'])->name('pekerjaan.edit');
Route::delete('/workline/{id}', [PekerjaansController::class, 'destroy'])->name('pekerjaan.destroy');

Route::get('/status', function () {
    return view('status-sb');
})->name('status');

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


// Logout
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');
Route::post('/', [AuthController::class, 'login'])->name('login.submit');
