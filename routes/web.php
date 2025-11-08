<?php

use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\PekerjaansController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DashboardController;
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
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('task-detail',function () {
    return view('task-detail');
})->name('task-detail');

// Route Task
Route::middleware(['auth'])->group(function() {
Route::get('/task', [TaskController::class, 'index'])->name('task');
Route::get('/print-po/{id}', [TaskController::class, 'showPrintPage'])->name('task.printPage');
Route::post('/task/store', [TaskController::class, 'store'])->name('task.store');
Route::post('/task/update/{id}', [TaskController::class, 'update'])->name('task.update');
Route::post('/checklist/update/{id}', [TaskController::class, 'updateChecklistStatus'])->name('checklist.updateStatus');
Route::post('/task/status/update/{id}', [TaskController::class, 'updateStatus'])->name('task.updateStatus');
Route::get('/task/edit/{id}', [TaskController::class, 'edit'])->name('task.edit');
Route::delete('/task/delete/{id}', [TaskController::class, 'destroy'])->name('task.destroy');
Route::get('/task/detail/{id}', [TaskController::class, 'show']) ->name('task.show'); 
Route::post('/task/comment/{task_id}', [TaskController::class, 'storeComment'])->name('task.storeComment');


// Rute untuk menandai semua notifikasi sebagai "telah dibaca"
Route::post('/notifications/mark-as-read', [TaskController::class, 'markAllAsRead'])->name('notifications.markAsRead');
});

// Rute untuk pekerjaan
Route::middleware('auth')->group(function () {
    Route::get('/workline', [PekerjaansController::class, 'index'])->name('workline');
    Route::post('/pekerjaan', [PekerjaansController::class, 'store'])->name('pekerjaan.store');
    Route::get('/pekerjaan/edit/{id}', [PekerjaansController::class, 'edit'])->name('pekerjaan.edit');
    Route::put('/pekerjaan/{id}', [PekerjaansController::class, 'update'])->name('pekerjaan.update');
    Route::delete('/pekerjaan/{id}', [PekerjaansController::class, 'destroy'])->name('pekerjaan.destroy');
});
// END Rute untuk pekerjaan //

Route::get('/status', function () {
    return view('status-sb');
})->name('status');
Route::get('/status/all', [StatusController::class, 'index'])->name('status.all');
Route::post('/status/store', [StatusController::class, 'store'])->name('status.store');
Route::put('/status/update/{id}', [StatusController::class, 'update'])->name('status.update');
Route::delete('/status/delete/{id}', [StatusController::class, 'destroy'])->name('status.destroy');

Route::get('/checklist', function () {
    return view('checklist-sb');
})->name('checklist');
Route::get('/checklist/all', [ChecklistController::class, 'index'])->name('checklist.all');
Route::post('/checklist/store', [ChecklistController::class, 'store'])->name('checklist.store');
Route::put('/checklist/update/{id}', [ChecklistController::class, 'update'])->name('checklist.update');
Route::delete('/checklist/delete/{id}', [ChecklistController::class, 'destroy'])->name('checklist.destroy');

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

