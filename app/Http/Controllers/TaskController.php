<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Pekerjaan;
use App\Models\Checklist;
use App\Models\User; // ✅ tambahkan ini
use Illuminate\Support\Facades\Auth; // ✅ untuk ambil user yang login

class TaskController extends Controller
{
    /**
     * Tampilkan form tambah task
     */
    public function create()
    {
        // Ambil semua user untuk dropdown (opsional kalau admin bisa pilih)
    $users = User::where('role', 'admin')->get(['id', 'name']);
    return view('task-sb', compact('users'));
    }

    /**
     * Simpan data task baru ke database
     */
    public function store(Request $request)
    {
        // 🔹 Validasi input dasar
        $validated = $request->validate([
            'invoice_number' => 'required|string|max:255',
            'nama_pelanggan' => 'required|string|max:255',
            'judul' => 'required|string|max:255',
            'catatan' => 'nullable|string',
            'penanggung_jawab' => 'nullable',
            'urgensi' => 'nullable|string|max:255',
            'mockup.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        // 🔹 Buat task baru
        $task = new Task();
        $task->no_invoice = $request->invoice_number;
        $task->nama_pelanggan = $request->nama_pelanggan;
        $task->judul = $request->judul;
        $task->catatan = $request->catatan;

        // 🔹 Jika user login, pakai ID user login
        if (Auth::check()) {
            $task->penanggung_jawab = Auth::user()->id;
        } else {
            // kalau tidak login (misalnya input manual)
            $task->penanggung_jawab = $request->penanggung_jawab;
        }

        $task->urgensi = $request->urgensi;
        $task->jumlah = $request->jumlah;
        $task->warna = $request->warna;
        $task->model = $request->model;
        $task->bahan = $request->bahan;

        // 🔹 Upload mockup (jika ada)
        if ($request->hasFile('mockup')) {
            $paths = [];
            foreach ($request->file('mockup') as $file) {
                $paths[] = $file->store('mockups', 'public');
            }
            $task->mockup = json_encode($paths);
        }

        // 🔹 Simpan jenis & size (dalam JSON)
        if ($request->has('jenis_size')) {
            $jenis_size = $request->jenis_size;
            $size = $request->size;
            $jumlah_size = $request->jumlah_size;

            $combined = [];
            foreach ($jenis_size as $i => $jenis) {
                $combined[] = [
                    'jenis' => $jenis,
                    'size' => $size[$i] ?? '',
                    'jumlah' => $jumlah_size[$i] ?? '',
                ];
            }

            $task->jenis_size = json_encode($combined);
        }

        $task->save();

        // 🔹 Simpan line pekerjaan dan checklist
        if ($request->has('line_pekerjaan')) {
            foreach ($request->line_pekerjaan as $i => $namaLine) {
                $pekerjaan = new Pekerjaan();
                $pekerjaan->task_id = $task->id;
                $pekerjaan->nama_pekerjaan = $namaLine;
                $pekerjaan->deadline = $request->line_deadline[$i] ?? null;
                $pekerjaan->save();

                // Checklist per line pekerjaan
                if (isset($request->checklist[$i])) {
                    foreach ($request->checklist[$i] as $checkItem) {
                        if (!empty($checkItem)) {
                            Checklist::create([
                                'task_line_id' => $pekerjaan->id,
                                'nama_item' => $checkItem,
                                'selesai' => false,
                            ]);
                        }
                    }
                }
            }
        }

        return redirect()->route('task')->with('success', '✅ Task berhasil ditambahkan!');
    }

    /**
     * Tampilkan semua task (opsional)
     */
    public function index()
    {
        $tasks = Task::with('pekerjaan.checklist')->get();
        return view('task.index', compact('tasks'));
    }

    /**
     * Detail task (opsional)
     */
    public function show($id)
    {
        $task = Task::with('pekerjaan.checklist')->findOrFail($id);
        return view('tasks.show', compact('task'));
    }
}
