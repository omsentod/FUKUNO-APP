<?php

namespace App\Http\Controllers;

use App\Models\Checklist;
use App\Models\Task;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    // Tambah checklist baru
    public function store(Request $request, $task_id)
    {
        $request->validate([
            'nama_item' => 'required|string|max:255',
        ]);

        Checklist::create([
            'task_id' => $task_id,
            'nama_item' => $request->nama_item,
        ]);

        return back()->with('success', 'Checklist berhasil ditambahkan!');
    }

    // Update status checklist (centang)
    public function toggle($id)
    {
        $checklist = Checklist::findOrFail($id);
        $checklist->selesai = !$checklist->selesai;
        $checklist->save();

        return back();
    }

    // Hapus checklist
    public function destroy($id)
    {
        Checklist::findOrFail($id)->delete();
        return back()->with('success', 'Checklist dihapus!');
    }
}
