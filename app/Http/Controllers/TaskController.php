<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_invoice' => 'required|string|unique:tasks',
            'nama_pelanggan' => 'required|string|max:255',
            'judul_task' => 'required|string|max:255',
            'start_date' => 'required|date',
            'urgent' => 'required|in:High,Medium,Low',
            'mockup_link' => 'nullable|url',
            'penanggung_jawab' => 'required|string|max:255',
            'jumlah' => 'required|integer|min:1',
            'jenis_pekerjaan' => 'required|string|max:255',
            'line_pekerjaan_id' => 'required|exists:pekerjaans,id', // Hanya ID yang ada di database
            'deadline' => 'required|date|after_or_equal:start_date',
            'note' => 'nullable|string',
        ]);

        $task = Task::create(array_merge($validated, ['user_id' => Auth::id()]));

        return response()->json([
            'message' => 'Task berhasil dibuat',
            'data' => $task
        ], 201);
    }
}
