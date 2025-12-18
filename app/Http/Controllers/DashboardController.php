<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task; // (Gunakan Model Task Anda)
use App\Models\Status; // (Gunakan Model Status Anda)
use App\Models\User; // (Gunakan Model User Anda)
use Carbon\Carbon; // (Untuk perhitungan waktu)

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard dengan data yang diagregasi.
     */
    public function index()
    {
        // --- 1. Ambil Data Kategori Task (To Do, On Progress, Complete) ---

        // Cara 1: Menggunakan relasi (Lebih bersih)
        $countToDo = Task::whereHas('status', fn($q) => $q->where('name', 'To Do'))->count();
        $countInProgress = Task::whereHas('status', fn($q) => $q->where('name', 'In Progress'))->count();
        $countComplete = Task::whereHas('status', fn($q) => $q->where('name', 'Done and Ready'))->count();
        $countHold = Task::whereHas('status', fn($q) => $q->where('name', 'Hold'))->count();
        // (Nanti Anda bisa tambahkan $countTrashed di sini)


        // --- 2. Ambil Data Tabel (Task Terbaru) ---
        $latestTasks = Task::with('status', 'taskPekerjaans') // Ambil relasi
                            ->orderBy('created_at', 'desc') // Urutkan terbaru
                            ->get();


        // --- 3. Ambil Data Tabel (Deadline Terdekat) ---
        $upcomingDeadlines = Task::with('user', 'status', 'taskPekerjaans')

        ->select('tasks.*', 'task_pekerjaans.deadline') 

        
        ->join('task_pekerjaans', 'tasks.id', '=', 'task_pekerjaans.task_id')
        
        // Filter Deadline Masa Depan
        ->where('task_pekerjaans.deadline', '>=', now())

        // Filter Status (Bukan Done/Delivered)
        ->whereHas('status', function ($query) {
            $query->whereNotIn('name', ['Done and Ready', 'Delivered']);
        })
        
        // Sorting
        ->orderBy('task_pekerjaans.deadline', 'asc')
        ->distinct() // Pastikan tidak duplikat
        ->take(5)
        ->get();
        
        // --- 4. Kirim semua data ke View ---
        return view('dashboard', [ 
            'countToDo' => $countToDo,
            'countInProgress' => $countInProgress,
            'countComplete' => $countComplete,
            'countHold' => $countHold,
            'latestTasks' => $latestTasks,
            'upcomingDeadlines' => $upcomingDeadlines,
            
        ]);
    }
}