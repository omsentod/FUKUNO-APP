<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Task;
use App\Models\TaskSize;
use App\Models\TaskPekerjaan; 
use App\Models\TaskChecklist; 
use App\Models\TaskMockup;    
use App\Models\Status;       
use App\Models\User;      
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Notifications\TaskCreated; 
use Illuminate\Support\Facades\Notification; 

class TaskController extends Controller
{
  
    public function index()
    {
        // 1. Ambil semua task dari DB, beserta relasinya
     $tasks = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')
                ->orderBy('created_at', 'asc')
                ->get();

        // 2. Kirim data tasks ke view 'task-sb'
        return view('task-sb', [
            'tasks' => $tasks
        ]);
    }


    public function store(Request $request)
{
    // 1. Validasi
    $validatedData = $request->validate([
        'noInvoice' => 'required|string',
        'namaPelanggan' => 'required|string|max:255',
        'judul' => 'required|string|max:255',
        'urgensi' => 'required|string',
        'jumlah' => 'required|integer',
        'lines' => 'required|json',
        'sizes' => 'nullable|json',
        'mockups.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    // 2. Ambil data Teks & Decode JSON
    $taskData = $request->except(['lines', 'sizes', 'mockups']);
    $lineData = json_decode($request->input('lines'), true);
    $sizeData = json_decode($request->input('sizes'), true);
    
    if (empty($lineData)) {
        return response()->json(['success' => false, 'message' => 'Harap tambahkan setidaknya satu line pekerjaan.'], 422);
    }

    $createdTasks = []; 

    try {
        DB::beginTransaction();

        // 3. Simpan Mockup Files (Hanya Sekali)
        $mockupPaths = [];
        if ($request->hasFile('mockups')) {
            foreach ($request->file('mockups') as $index => $file) {
                $path = $file->store('mockups', 'public'); 
                $mockupPaths[] = ['file_path' => $path, 'order' => $index];
            }
        }

        // 4. Loop untuk setiap Line Pekerjaan
        foreach ($lineData as $line) {
            
            $task = new Task();
            $task->no_invoice = $taskData['noInvoice'];
            $task->nama_pelanggan = $taskData['namaPelanggan'];
            $task->judul = $taskData['judul'];
            $task->catatan = $taskData['catatan'] ?? null;
            $task->user_id = auth()->id();
            $task->urgensi = $taskData['urgensi'];
            $task->total_jumlah = $taskData['jumlah'];
            $task->warna = $taskData['warna'] ?? null;
            $task->model = $taskData['model'] ?? null;
            $task->bahan = $taskData['bahan'] ?? null;
            $task->status_id = 1; 
            $task->save(); 

            // 5. Simpan Line Pekerjaan
            $taskLine = $task->taskPekerjaans()->create([ 
                'nama_pekerjaan' => $line['nama'],
                'deadline' => $line['deadline']
            ]);
            
            // 6. Simpan Checklists
            if (!empty($line['checklists'])) {
                $checklists = [];
                foreach ($line['checklists'] as $checklistName) {
                    $checklists[] = ['nama_checklist' => $checklistName];
                }
                $taskLine->checklists()->createMany($checklists);
            }

            // 7. Simpan Data Size
            if (!empty($sizeData) && !empty($sizeData['headers']) && !empty($sizeData['rows'])) {
                $headers = $sizeData['headers'];
                $sizeEntries = [];
                foreach ($sizeData['rows'] as $rowData) {
                    $jenis = $rowData['jenis'];
                    foreach ($headers as $tipe) {
                        $jumlah = $rowData['quantities'][$tipe] ?? 0;
                        if ($jumlah > 0) {
                            $sizeEntries[] = [ 'task_id' => $task->id, 'jenis' => $jenis, 'tipe' => $tipe, 'jumlah' => $jumlah, 'created_at' => now(), 'updated_at' => now(), ];
                        }
                    }
                }
                if (!empty($sizeEntries)) TaskSize::insert($sizeEntries);
            }
            
            // 8. Simpan Mockup Files
            if (!empty($mockupPaths)) {
                $task->mockups()->createMany($mockupPaths);
            }
            
            // 9. Kumpulkan task
            $createdTasks[] = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')->find($task->id);

        } // <-- Akhir dari loop foreach

        // ▼▼▼ PERBAIKI BAGIAN INI ▼▼▼
        
        // 10. Dapatkan user (KECUALI diri sendiri)
        $usersToNotify = User::where('id', '!=', auth()->id())->get();

        // 11. Kirim notifikasi
        if (count($createdTasks) > 0) {
            // Kirim notif berdasarkan task pertama DAN user yang login (auth()->user())
            Notification::send($usersToNotify, new TaskCreated($createdTasks[0], auth()->user()));
        }
        // ▲▲▲ AKHIR PERBAIKAN ▲▲▲

        // 12. Commit
        DB::commit();
        
        // 13. Kirim kembali ARRAY of tasks
        return response()->json([
            'success' => true, 
            'message' => 'Task berhasil disimpan!',
            'tasks' => $createdTasks
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false, 
            'message' => 'Gagal menyimpan task: ' . $e->getMessage()
        ], 500);
    }
}

public function markNotificationsAsRead(Request $request)
    {
        // Tandai semua notifikasi milik user yang login sebagai 'read'
        Auth::user()->unreadNotifications->markAsRead();
        
        return response()->json(['success' => true]);
    }

public function showPrintPage($id) 
{
    $task = Task::with('user', 'taskPekerjaans.checklists', 'mockups', 'taskSizes')
                ->findOrFail($id); 


    $tipeHeaders = $task->taskSizes->pluck('tipe')->unique();
    
    $jenisRows = $task->taskSizes->groupBy('jenis');

    return view('download-task', [
        'task' => $task,
        'tipeHeaders' => $tipeHeaders,
        'jenisRows' => $jenisRows
    ]);
}


    public static function buatInisial($nama)
    {
        if (!$nama) return '??';
        $words = explode(' ', $nama);
        $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
        return $initials;
    }

    public function updateChecklistStatus(Request $request, $id)
    {
        $checklist = TaskChecklist::find($id);

        if (!$checklist) {
            return response()->json(['success' => false, 'message' => 'Checklist not found.'], 404);
        }

        $request->validate([
            'is_completed' => 'required|boolean'
        ]);

        $checklist->is_completed = $request->input('is_completed');
        $checklist->save();

    
        return response()->json([
            'success' => true, 
            'message' => 'Checklist updated!'
        ]);
    }
    
    public function updateStatus(Request $request, $id)
    {
        // Validasi input (memastikan kita dikirimi nama status)
        $request->validate(['status_name' => 'required|string']);
    
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found.'], 404);
        }
    
        // Cari ID status baru berdasarkan nama yang dikirim JS
        $newStatus = Status::where('name', $request->status_name)->first();
        if (!$newStatus) {
            return response()->json(['success' => false, 'message' => 'Status name not found.'], 404);
        }
    
        // Update status_id di task
        $task->status_id = $newStatus->id;
        $task->save();
    
        return response()->json(['success' => true, 'message' => 'Status updated.']);
    }

    public function destroy($id)
    {
        // 1. Temukan task
        $task = Task::find($id);

        // 2. Jika tidak ketemu, kirim error
        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task tidak ditemukan.'], 404);
        }

        try {
            // 3. Hapus task
            $task->delete();
            // Catatan: Jika migration Anda punya ->onDelete('cascade'),
            // semua relasi (line, checklist, size, mockup) akan ikut terhapus.

            // 4. Kirim respons sukses
            return response()->json(['success' => true, 'message' => 'Task berhasil dihapus.']);

        } catch (\Exception $e) {
            // Kirim respons gagal jika ada error database
            return response()->json(['success' => false, 'message' => 'Gagal menghapus task: ' . $e->getMessage()], 500);
        }
    }

}