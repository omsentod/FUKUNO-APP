<?php

namespace App\Http\Controllers;

use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PekerjaansController extends Controller
{
    public function index() {
        // Menampilkan pekerjaan yang diurutkan berdasarkan ID secara ascending
        $pekerjaans = Pekerjaan::orderBy('id', 'asc')->get();
        return view('work-line-sb', compact('pekerjaans'));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'job_name' => 'required|string|max:255',
        ]);
        
        $pekerjaan = Pekerjaan::create([
            'job_name' => $validated['job_name'],
        ]);
    
        // Jika request AJAX, return JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'pekerjaan' => $pekerjaan,
                'message' => 'Pekerjaan berhasil ditambahkan.'
            ]);
        }
    
        return redirect()->route('workline')->with('success', 'Line pekerjaan ditambahkan.');
    }

    public function update(Request $request, $id)
{
    $validated = $request->validate([
        'job_name' => 'required|string|max:255',
    ]);
    
    $pekerjaan = Pekerjaan::findOrFail($id);
    $pekerjaan->update([
        'job_name' => $validated['job_name'],
    ]);

    // Jika request AJAX, return JSON
    if ($request->expectsJson()) {
        return response()->json([
            'success' => true,
            'pekerjaan' => $pekerjaan,
            'message' => 'Pekerjaan berhasil diupdate.'
        ]);
    }

    return redirect()->route('workline')->with('success', 'Line pekerjaan diperbarui.');
}

public function destroy($id)
{
    try {
        // Cari dan hapus data
        $pkj = Pekerjaan::findOrFail($id);
        $pkj->delete();

        // Reset AUTO_INCREMENT hanya jika tabel kosong
        $count = Pekerjaan::count();
        if ($count == 0) {
            DB::statement("ALTER TABLE pekerjaans AUTO_INCREMENT = 1");
        }

        // Response untuk AJAX
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pekerjaan berhasil dihapus.' . ($count == 0 ? ' ID akan dimulai dari 1 untuk data baru.' : '')
            ]);
        }

        // Response untuk redirect
        return redirect()->route('workline')->with('success', 'Line pekerjaan berhasil dihapus.');
        
    } catch (\Exception $e) {
        // Log error untuk debugging
        \Log::error('Error deleting pekerjaan ID ' . $id . ': ' . $e->getMessage());

        // Response error untuk AJAX
        if (request()->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pekerjaan: ' . $e->getMessage()
            ], 500);
        }

        // Response error untuk redirect
        return redirect()->route('workline')->with('error', 'Gagal menghapus pekerjaan: ' . $e->getMessage());
    }
}

}