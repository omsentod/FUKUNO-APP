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
use App\Models\Comment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Notifications\TaskCreated; 
use App\Notifications\CommentAdded;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification; 

class TaskController extends Controller
{
  
    public function index(Request $request) // <-- 1. Tambahkan Request $request
    {
        // 2. Ambil semua task dari DB
        $tasks = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')
                    ->orderBy('created_at', 'asc') // (Atau 'desc' sesuai urutan Anda)
                    ->get();
        
        // 3. Ambil ID highlight dari URL
        $highlightId = $request->query('highlight');
    
        // 4. Kirim data tasks DAN highlightId ke view
        return view('task-sb', [
            'tasks' => $tasks,
            'highlightId' => $highlightId ?? null // Kirim ID highlight
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

    
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        
        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
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

   // (Pastikan Anda sudah 'use App\Models\TaskChecklist;' dan 'use App\Models\Status;' di atas)

/**
 * Meng-update status 'is_completed' dari satu checklist
 * DAN meng-update status Task induknya.
 */
public function updateChecklistStatus(Request $request, $id)
{
    // 1. Validasi
    $request->validate(['is_completed' => 'required|boolean']);

    // 2. Temukan dan update checklist
    $checklist = TaskChecklist::find($id);
    if (!$checklist) {
        return response()->json(['success' => false, 'message' => 'Checklist not found.'], 404);
    }
    
    $checklist->is_completed = $request->input('is_completed');
    $checklist->save();

    // 3. Ambil Task Induk (HANYA 1 task yang memiliki checklist ini)
    $task = $checklist->taskPekerjaan->task;

    // 4. Cek status "Hold"
    $task->load('status'); 
    if ($task->status->name == 'Hold') {
        return response()->json([
            'success' => true, 
            'message' => 'Checklist updated, but task is on Hold.'
        ]);
    }

    // ▼▼▼ PERUBAHAN: Hitung progress HANYA untuk task INI ▼▼▼
    $task->load('taskPekerjaans.checklists'); 
    $allChecklists = $task->taskPekerjaans->flatMap->checklists;
    $total = $allChecklists->count();
    $completed = $allChecklists->where('is_completed', true)->count();
    $percentage = ($total > 0) ? (int) round(($completed / $total) * 100) : 0;
    // ▲▲▲ Sekarang hanya menghitung 1 task, bukan semua task di grup PO ▲▲▲

    // 5. Tentukan status baru HANYA untuk task ini
    $newStatusName = 'Needs Work';
    if ($percentage === 100) {
        $newStatusName = 'Done and Ready';
    } else if ($percentage > 0) {
        $newStatusName = 'In Progress';
    }

    // 6. Update status HANYA untuk task ini
    $newStatus = Status::where('name', $newStatusName)->first();
    if ($newStatus && $task->status_id != $newStatus->id) {
        $task->status_id = $newStatus->id;
        $task->save();
    }

    // 7. Kirim respons sukses
    return response()->json([
        'success' => true, 
        'message' => 'Checklist and Task Status updated!',
        'new_percentage' => $percentage,
        'task_id' => $task->id // Untuk debugging
    ]);
}
    public function show($id)
    {
        // 1. Temukan task utama yang diklik
        $mainTask = Task::findOrFail($id);

        // 2. Dapatkan No. PO-nya
        $noPo = $mainTask->no_invoice;

        // 3. Ambil SEMUA task (termasuk dirinya sendiri) yang punya No. PO yang sama
        $allTasksInGroup = Task::with('user', 'status', 'taskPekerjaans.checklists', 'mockups', 'taskSizes')
                            ->where('no_invoice', $noPo)
                            ->orderBy('created_at', 'asc') // Urutkan berdasarkan line
                            ->get();

        // 4. Ambil ID dari semua task di grup ini
        $allTaskIds = $allTasksInGroup->pluck('id');

        // 5. Ambil semua komentar dari SEMUA task di grup ini
        $comments = Comment::with('user')
                        ->whereIn('task_id', $allTaskIds)
                        ->orderBy('created_at', 'asc')
                        ->get();

        // 6. Siapkan data tabel size (Ambil dari task utama, asumsi data size sama)
        $tipeHeaders = $mainTask->taskSizes->pluck('tipe')->unique();
        $jenisRows = $mainTask->taskSizes->groupBy('jenis');
        
        // 7. Hitung progres gabungan
        $allChecklists = $allTasksInGroup->flatMap->taskPekerjaans->flatMap->checklists;
        $total = $allChecklists->count();
        $completed = $allChecklists->where('is_completed', true)->count();
        $percentage = ($total > 0) ? round(($completed / $total) * 100) : 0;

        // 8. Kirim semua data ke view
        return view('task-detail', [
            'mainTask' => $mainTask,             
            'allTasksInGroup' => $allTasksInGroup, 
            'comments' => $comments,           
            'tipeHeaders' => $tipeHeaders,        
            'jenisRows' => $jenisRows,             
            'progressPercentage' => $percentage    
        ]);
    }

    public function storeComment(Request $request, $task_id)
    {
        $request->validate(['body' => 'required|string']);

        $task = Task::findOrFail($task_id); 
        
        $comment = $task->comments()->create([
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);
        $comment->load('user');

      
        $usersToNotify = User::where('id', '!=', Auth::id())->get();
        Notification::send($usersToNotify, new CommentAdded($comment));

        return response()->json(['success' => true, 'comment' => $comment]);
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

    public function edit($id)
    {
        // 1. Temukan task utama yang diklik
        $mainTask = Task::findOrFail($id);
    
        // 2. Dapatkan No. PO-nya
        $noPo = $mainTask->no_invoice;
    
        // 3. Ambil SEMUA task (termasuk dirinya sendiri) yang punya No. PO yang sama
        $allTasksInGroup = Task::with('user', 'status', 'taskPekerjaans.checklists', 'mockups', 'taskSizes')
                            ->where('no_invoice', $noPo)
                            ->orderBy('created_at', 'asc')
                            ->get();
    
        // 4. Ambil data size
        $tipeHeaders = $mainTask->taskSizes->pluck('tipe')->unique()->values();
        $jenisRows = $mainTask->taskSizes->groupBy('jenis');
        
        $sizeData = [
            'headers' => $tipeHeaders,
            'rows' => $jenisRows
        ];
    
    
        $mainTask->load('mockups'); 
        $mainTaskData = $mainTask->toArray();
    
        if (!empty($mainTaskData['mockups'])) {
            foreach ($mainTaskData['mockups'] as &$mockup) {
                // Tambahkan URL lengkap (accessible dari browser)
                $mockup['file_path_url'] = Storage::url($mockup['file_path']);
            }
        }
        // 6. Kirim kembali SEMUA task sebagai JSON
        return response()->json([
            'success' => true,
            'task' => $mainTaskData, // ← Data mockup sekarang punya URL
            'allTasks' => $allTasksInGroup,
            'sizeData' => $sizeData
        ]);
    }



    public function update(Request $request, $id)
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
            'mockups.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'existing_mockup_urls' => 'nullable|json',
            'mockups_to_delete' => 'nullable|json'
        ]);
    
        // 2. Ambil data
        $taskData = $request->except(['lines', 'sizes', 'mockups', 'existing_mockup_urls', 'mockups_to_delete']);
        $lineData = json_decode($request->input('lines'), true);
        $sizeData = json_decode($request->input('sizes'), true);
        
        if (empty($lineData)) {
            return response()->json(['success' => false, 'message' => 'Line pekerjaan tidak boleh kosong.'], 422);
        }
    
        try {
            DB::beginTransaction();
    
            // ============================================================
            // 3. PERSIAPAN MOCKUP (Dilakukan SEKALI di luar loop)
            // ============================================================
            
            // 3a. Upload Mockup BARU
            $newMockupPaths = [];
            if ($request->hasFile('mockups')) {
                foreach ($request->file('mockups') as $index => $file) {
                    $path = $file->store('mockups', 'public'); 
                    $newMockupPaths[] = ['file_path' => $path, 'order' => $index]; 
                }
            }
    
            // 3b. Ambil Mockup LAMA (yang TERSISA)
            $existingMockupUrls = json_decode($request->input('existing_mockup_urls'), true) ?? [];
            $existingMockupPaths = [];
            foreach ($existingMockupUrls as $index => $url) {
                $relativePath = str_replace(Storage::url(''), '', $url);
                $existingMockupPaths[] = ['file_path' => $relativePath, 'order' => $index];
            }
            
            // 3c. Gabungkan Mockup Lama + Baru
            $allMockupPaths = array_merge($existingMockupPaths, $newMockupPaths);
    
            // 3d. Hapus File Mockup LAMA (yang dihapus user)
            $mockupsToDeleteUrls = json_decode($request->input('mockups_to_delete'), true) ?? [];
            $pathsToDelete = [];
            foreach ($mockupsToDeleteUrls as $url) {
                $pathsToDelete[] = str_replace(Storage::url(''), '', $url);
            }
            if (!empty($pathsToDelete)) {
                Storage::disk('public')->delete($pathsToDelete);
            }
    
            // ============================================================
            // 4. PERSIAPAN SIZE (Dilakukan SEKALI di luar loop)
            // ============================================================
            $sizeEntries = [];
            if (!empty($sizeData) && !empty($sizeData['headers']) && !empty($sizeData['rows'])) {
                $headers = $sizeData['headers'];
                foreach ($sizeData['rows'] as $rowData) {
                    $jenis = $rowData['jenis'];
                    foreach ($headers as $tipe) {
                        $jumlah = $rowData['quantities'][$tipe] ?? 0;
                        if ($jumlah > 0) {
                            // Kita simpan dulu ke array, nanti di-insert PER task
                            $sizeEntries[] = [
                                'jenis' => $jenis,
                                'tipe' => $tipe,
                                'jumlah' => $jumlah
                            ];
                        }
                    }
                }
            }
    
            // ============================================================
            // 5. SIMPAN DATA LAMA (Sebelum Hapus)
            // ============================================================
            $originalTask = Task::findOrFail($id);
            $noInvoice = $originalTask->no_invoice;
            $allTasksInGroup = Task::with('comments', 'status')->where('no_invoice', $noInvoice)->orderBy('id', 'asc')->get();
            
            // Simpan status lama & komentar lama
            $oldStatuses = [];
            $oldComments = [];
            foreach ($allTasksInGroup as $index => $oldTask) {
                $oldStatuses[$index] = $oldTask->status_id;
                $oldComments[$index] = $oldTask->comments; // Collection of Comment models
            }
            
            // Cek apakah jumlah line berubah
            $oldLineCount = count($allTasksInGroup);
            $newLineCount = count($lineData);
            $lineCountChanged = ($oldLineCount !== $newLineCount);
            
            // ============================================================
            // 6. HAPUS SEMUA TASK LAMA (1 No. PO)
            // ============================================================
            foreach ($allTasksInGroup as $taskToDelete) {
                $taskToDelete->delete(); // Cascade akan hapus relasi
            }
    
            // ============================================================
            // 6. BUAT ULANG TASK BARU (LOOP PER LINE)
            // ============================================================
            $createdTasks = []; 
    
            foreach ($lineData as $line) {
                
                // A. Buat Task Baru
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
    
                // B. Simpan Line Pekerjaan (BERBEDA per task)
                $taskLine = $task->taskPekerjaans()->create([ 
                    'nama_pekerjaan' => $line['nama'],
                    'deadline' => $line['deadline']
                ]);
                
                // C. Simpan Checklists (BERBEDA per task)
                if (!empty($line['checklists'])) {
                    $checklists = [];
                    foreach ($line['checklists'] as $checklistName) {
                        $checklists[] = ['nama_checklist' => $checklistName];
                    }
                    $taskLine->checklists()->createMany($checklists);
                }
    
                // D. Simpan Data Size (SAMA untuk semua task)
                if (!empty($sizeEntries)) {
                    $taskSizeEntries = [];
                    foreach ($sizeEntries as $entry) {
                        $taskSizeEntries[] = [
                            'task_id' => $task->id, // ID task yang baru dibuat
                            'jenis' => $entry['jenis'],
                            'tipe' => $entry['tipe'],
                            'jumlah' => $entry['jumlah'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                    TaskSize::insert($taskSizeEntries);
                }
                
                // E. Simpan Mockup Files (SAMA untuk semua task)
                // PENTING: Setiap task perlu record TERPISAH di tabel task_mockups
                if (!empty($allMockupPaths)) {
                    foreach ($allMockupPaths as $mockup) {
                        $task->mockups()->create([
                            'file_path' => $mockup['file_path'],
                            'order' => $mockup['order']
                        ]);
                    }
                }
                
                // F. Kumpulkan task untuk respons
                $createdTasks[] = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')->find($task->id);
            }
        
            // ============================================================
            // 7. COMMIT & RESPONS
            // ============================================================
            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => 'Task berhasil diperbarui!',
                'tasks' => $createdTasks
            ]);
        
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false, 
                'message' => 'Gagal memperbarui task: ' . $e->getMessage()
            ], 500);
        }
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