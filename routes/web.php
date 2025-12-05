<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\PekerjaansController;

// ==========================
// GUEST ROUTES (Tanpa Login)
// ==========================

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/login', function () {
    return view('login');
})->name('login');

// Proses Login & Register
Route::post('/', [AuthController::class, 'login'])->name('login.submit');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');

// Halaman Register (Biasanya tamu boleh akses)
Route::get('/register', function () {
    return view('regis');
})->name('regis');


Route::middleware(['auth'])->group(function() {

    // --- GLOBAL ---
    Route::get('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user-name', [AuthController::class, 'getUserName']);

    // --- DASHBOARD ---
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- TASKS ---
    Route::get('/task', [TaskController::class, 'index'])->name('task');
    Route::get('/task/detail/{id}', [TaskController::class, 'show'])->name('task.show');
    Route::post('/task/store', [TaskController::class, 'store'])->name('task.store');
    Route::post('/task/update/{id}', [TaskController::class, 'update'])->name('task.update');
    Route::get('/task/edit/{id}', [TaskController::class, 'edit'])->name('task.edit');
    Route::delete('/task/delete/{id}', [TaskController::class, 'destroy'])->name('task.destroy');
    Route::get('/task/export', [TaskController::class, 'exportExcel'])->name('task.export');
    
    // Task Actions
    Route::post('/task/status/update/{id}', [TaskController::class, 'updateStatus'])->name('task.updateStatus');
    Route::post('/task/comment/{task_id}', [TaskController::class, 'storeComment'])->name('task.storeComment');
    Route::get('/print-po/{id}', [TaskController::class, 'showPrintPage'])->name('task.printPage');
    
    // Archive & Trash
    Route::get('/archive', [TaskController::class, 'showArchive'])->name('archive');
    Route::get('/trash', [TaskController::class, 'showTrash'])->name('trash');
    Route::post('/task/restore/{id}', [TaskController::class, 'restore'])->name('task.restore');
    Route::post('/task/unarchive/{id}', [TaskController::class, 'unarchive'])->name('task.unarchive');
    
    // Bulk Actions
    Route::post('/tasks/bulk-action', [TaskController::class, 'bulkAction'])->name('task.bulkAction');
    // (Route trashBulkAction bisa dihapus karena sudah digabung ke bulkAction, tapi jika mau dipakai tetap oke)
    Route::post('/trash/bulk-action', [TaskController::class, 'trashBulkAction'])->name('trash.bulkAction'); 

    // Notifications
    // Pastikan nama method di controller adalah 'markNotificationsAsRead'
    Route::post('/notifications/mark-as-read', [TaskController::class, 'markNotificationsAsRead'])->name('notifications.markAsRead');


    // --- CHECKLISTS ---
    Route::get('/checklist', function () { return view('checklist-sb'); })->name('checklist');
    Route::get('/checklist/all', [ChecklistController::class, 'index'])->name('checklist.all');
    Route::post('/checklist/store', [ChecklistController::class, 'store'])->name('checklist.store');
    Route::put('/checklist/update/{id}', [ChecklistController::class, 'update'])->name('checklist.update');
    Route::delete('/checklist/delete/{id}', [ChecklistController::class, 'destroy'])->name('checklist.destroy');
    
    // Checklist Search & Update Status
    Route::get('/checklists/search', [ChecklistController::class, 'search'])->name('checklist.search');
    Route::post('/checklist/update/{id}', [TaskController::class, 'updateChecklistStatus'])->name('checklist.updateStatus');


    // --- PEKERJAAN (WORKLINE) ---
    Route::get('/workline', [PekerjaansController::class, 'index'])->name('workline');
    Route::post('/pekerjaan', [PekerjaansController::class, 'store'])->name('pekerjaan.store');
    Route::get('/pekerjaan/edit/{id}', [PekerjaansController::class, 'edit'])->name('pekerjaan.edit');
    Route::put('/pekerjaan/{id}', [PekerjaansController::class, 'update'])->name('pekerjaan.update');
    Route::delete('/pekerjaan/{id}', [PekerjaansController::class, 'destroy'])->name('pekerjaan.destroy');
    Route::get('/pekerjaan/search', [PekerjaansController::class, 'search'])->name('pekerjaan.search');


    // --- USER MANAGEMENT ---
    Route::get('/user', [UserController::class, 'index'])->name('user');
    Route::get('/user/list', [UserController::class, 'list'])->name('user.list');
    Route::post('/user/store', [UserController::class, 'store'])->name('user.store');
    
    // Perbaikan: Ganti PUT ke POST agar sesuai dengan JS Fetch FormData
    Route::post('/user/update/{id}', [UserController::class, 'update'])->name('user.update');
    
    Route::delete('/user/delete/{id}', [UserController::class, 'destroy'])->name('user.delete');

    // --- STATUS MASTER ---
    Route::get('/status', function () { return view('status-sb'); })->name('status');
    Route::get('/status/all', [StatusController::class, 'index'])->name('status.all');
    Route::post('/status/store', [StatusController::class, 'store'])->name('status.store');
    Route::put('/status/update/{id}', [StatusController::class, 'update'])->name('status.update');
    Route::delete('/status/delete/{id}', [StatusController::class, 'destroy'])->name('status.destroy');

});