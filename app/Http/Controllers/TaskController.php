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
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TasksExport;

class TaskController extends Controller
{
  
    public function index(Request $request) 
{
    // 1. Tentukan SEMUA kolom yang BOLEH di-sort
    // (Gunakan nama logis untuk relasi)
    $allowedSorts = [
        'no_invoice', 
        'judul', 
        'total_jumlah', 
        'urgensi',
        'nama_pelanggan', // Ini adalah 'Klien'
        'status',         // Relasi: 'statuses.name'
        'line',           // Relasi: 'task_pekerjaans.nama_pekerjaan'
        'deadline'        // Relasi: 'task_pekerjaans.deadline'
    ];

    // 2. Ambil parameter 'sort' & 'order' dari URL
    //    Default: urutkan berdasarkan 'created_at' (terlama)
    $sortColumn = $request->query('sort', 'created_at');
    $sortOrder = $request->query('order', 'asc');

    // 3. Keamanan: Jika user mencoba sort kolom aneh, kembalikan ke default
    if (!in_array($sortColumn, $allowedSorts) && $sortColumn != 'created_at') {
        $sortColumn = 'created_at';
    }
    if (!in_array($sortOrder, ['asc', 'desc'])) {
        $sortOrder = 'asc';
    }

    // 4. Mulai Kueri
    $query = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')
                 ->select('tasks.*')
                 ->where('is_archived', false); 
                 

    // 5. Terapkan Sorting (JOIN jika perlu)
    if ($sortColumn == 'status') {
        // --- Sort berdasarkan Nama Status ---
        $query->join('statuses', 'tasks.status_id', '=', 'statuses.id')
              ->orderBy('statuses.name', $sortOrder);
              
    } elseif ($sortColumn == 'line' || $sortColumn == 'deadline') {
        // --- Sort berdasarkan Line Pekerjaan atau Deadline ---
        // Map 'line' (logis) ke 'nama_pekerjaan' (database)
        $realSortColumn = ($sortColumn == 'line') ? 'nama_pekerjaan' : 'deadline';
        
        $query->join('task_pekerjaans', 'tasks.id', '=', 'task_pekerjaans.task_id')
              ->orderBy('task_pekerjaans.' . $realSortColumn, $sortOrder);
              
    } else {
        // --- Sort berdasarkan kolom di tabel 'tasks' (no_invoice, judul, nama_pelanggan, dll) ---
        $query->orderBy($sortColumn, $sortOrder);
    }
    
    // 6. Eksekusi Kueri
    $tasks = $query->get();
    
    // 7. Ambil ID highlight (Anda sudah punya ini)
    $highlightId = $request->query('highlight');

    // 8. Kirim semua data ke view
    return view('task-sb', [
        'tasks' => $tasks,
        'highlightId' => $highlightId ?? null,
        'currentSort' => $sortColumn,   // Kirim info sort saat ini
        'currentOrder' => $sortOrder, // Kirim info order saat ini
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
            'mockups.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);
        

        $taskData = $request->except(['lines', 'sizes', 'mockups']);
        $lineData = json_decode($request->input('lines'), true);
        $sizeData = json_decode($request->input('sizes'), true);
        
        if (empty($lineData)) {
            return response()->json(['success' => false, 'message' => 'Harap tambahkan setidaknya satu line pekerjaan.'], 422);
        }

        $createdTasks = []; 

        try {
            DB::beginTransaction();

            // 2. Simpan Mockup Files
            $mockupPaths = [];
            if ($request->hasFile('mockups')) {
                foreach ($request->file('mockups') as $index => $file) {
                    $path = $file->store('mockups', 'public'); 
                    $mockupPaths[] = ['file_path' => $path, 'order' => $index];
                }
            }

            // 3. Loop untuk setiap Line Pekerjaan
            foreach ($lineData as $line) {
                
                $task = new Task();
                $task->no_invoice = $taskData['noInvoice'];
                $task->nama_pelanggan = $taskData['namaPelanggan'];
                $task->judul = $taskData['judul'];
                $task->catatan = $taskData['catatan'] ?? null;
                $task->user_id = auth()->id();
                $task->urgensi = $taskData['urgensi'];
                $task->size_title = $sizeData['size_title'] ?? 'Size';
                $task->total_jumlah = $taskData['jumlah'];
                $task->warna = $taskData['warna'] ?? null;
                $task->model = $taskData['model'] ?? null;
                $task->bahan = $taskData['bahan'] ?? null;
                $task->status_id = 1; 
                $task->save(); 

                // Simpan Line Pekerjaan
                $taskLine = $task->taskPekerjaans()->create([ 
                    'nama_pekerjaan' => $line['nama'],
                    'deadline' => $line['deadline']
                ]);
                
                // Simpan Checklists (Handle String atau Object dari JS)
                if (!empty($line['checklists'])) {
                    $checklists = [];
                    foreach ($line['checklists'] as $checkData) {
                        // Cek apakah data string (input manual) atau object (dari getLineData)
                        $name = is_array($checkData) ? $checkData['name'] : $checkData;
                        $checklists[] = ['nama_checklist' => $name];
                    }
                    $taskLine->checklists()->createMany($checklists);
                }

                // Simpan Data Size (GUNAKAN CREATE)
                if (!empty($sizeData) && !empty($sizeData['headers']) && !empty($sizeData['rows'])) {
                    $headers = $sizeData['headers'];
                    foreach ($sizeData['rows'] as $rowData) {
                        $jenis = $rowData['jenis'];
                        foreach ($headers as $tipe) {
                            $jumlah = $rowData['quantities'][$tipe] ?? 0;
                            if ($jumlah > 0) {
                                // ▼▼▼ FIX: Gunakan create() agar aman ▼▼▼
                                TaskSize::create([
                                    'task_id' => $task->id,
                                    'jenis' => $jenis,
                                    'tipe' => $tipe,
                                    'jumlah' => (int) $jumlah
                                ]);
                            }
                        }
                    }
                }
                
                // Simpan Mockup Files
                if (!empty($mockupPaths)) {
                    $task->mockups()->createMany($mockupPaths);
                }
                
                $createdTasks[] = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')->find($task->id);
            }

            // Notifikasi
            $usersToNotify = User::where('id', '!=', auth()->id())->get();
            if (count($createdTasks) > 0) {
                Notification::send($usersToNotify, new TaskCreated($createdTasks[0], auth()->user()));
            }

            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => 'Task berhasil disimpan!',
                'tasks' => $createdTasks
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal menyimpan task: ' . $e->getMessage()], 500);
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

        $allTasks = Task::with('taskPekerjaans')
                        ->where('no_invoice', $task->no_invoice)
                        ->get();

        $projectFinishDate = $allTasks->flatMap->taskPekerjaans->max('deadline');

       
        $lineList = $allTasks->map(function($t) {
            $line = $t->taskPekerjaans->first();
            return (object) [
                'name' => $line ? $line->nama_pekerjaan : 'N/A',
                'date' => $line && $line->deadline ? \Carbon\Carbon::parse($line->deadline)->format('d-M') : '-'
            ];
        });

        $tipeHeaders = $task->taskSizes->pluck('tipe')->unique();
        $jenisRows = $task->taskSizes->groupBy('jenis');

        return view('download-task', [
            'task' => $task,
            'tipeHeaders' => $tipeHeaders,
            'jenisRows' => $jenisRows,
            'projectFinishDate' => $projectFinishDate, 
            'lineList' => $lineList 
        ]);

        // $lineListString = $allTasks->flatMap->taskPekerjaans
        //                            ->pluck('nama_pekerjaan')
        //                            ->unique()
        //                            ->implode(', ');

        // $tipeHeaders = $task->taskSizes->pluck('tipe')->unique();
        // $jenisRows = $task->taskSizes->groupBy('jenis');

        // return view('download-task', [
        //     'task' => $task,
        //     'tipeHeaders' => $tipeHeaders,
        //     'jenisRows' => $jenisRows,
        //     'projectFinishDate' => $projectFinishDate,
        //     'lineListString' => $lineListString 
        // ]);
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

    $task->load('taskPekerjaans.checklists'); 
    $allChecklists = $task->taskPekerjaans->flatMap->checklists;
    $total = $allChecklists->count();
    $completed = $allChecklists->where('is_completed', true)->count();
    $percentage = ($total > 0) ? (int) round(($completed / $total) * 100) : 0;

    // 5. Tentukan status baru HANYA untuk task ini
    $newStatusName = 'Needs Work';
    if ($percentage === 100) {
        $newStatusName = 'Done and Ready';
        $task->completed_at = now();
    } else if ($percentage > 0) {
        $newStatusName = 'In Progress';
        $task->completed_at = null;
    } else {
        $newStatusName = 'Needs Work';
        $task->completed_at = null; 
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
<<<<<<< HEAD
        $allTasksInGroup = Task::with('user', 'status', 'taskPekerjaans.checklists', 'mockups', 'taskSizes')
                            ->where('no_invoice', $noPo)
                            ->orderBy('created_at', 'asc') // Urutkan berdasarkan line
                            ->get();
=======
        $query = Task::with('user', 'status', 'taskPekerjaans.checklists', 'mockups', 'taskSizes')
                     ->where('no_invoice', $noPo)
                     ->orderBy('created_at', 'asc');

        if ($mainTask->trashed()) {
            $query->withTrashed();
        }
        $allTasksInGroup = $query->get();
>>>>>>> task

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
        // 1. Validasi input
        $request->validate(['status_name' => 'required|string']);
    
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found.'], 404);
        }
    
        // ▼▼▼ PERBAIKAN: Definisikan variabel ini dulu ▼▼▼
        $newStatusName = $request->status_name; 
        // ▲▲▲ ▲▲▲ ▲▲▲
    
        // 2. Cari ID status baru
        $newStatus = Status::where('name', $newStatusName)->first();
        if (!$newStatus) {
            return response()->json(['success' => false, 'message' => 'Status name not found.'], 404);
        }
    
        // 3. Update status_id
        $task->status_id = $newStatus->id;
    
        if ($newStatusName == 'Done and Ready') {
            $task->completed_at = now();
        } else if ($newStatusName != 'Hold') { 
            $task->completed_at = null; 
        }
        
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
            'lines' => 'required|json',
            'sizes' => 'nullable|json',
            'mockups.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'existing_mockup_urls' => 'nullable|json',
            'mockups_to_delete' => 'nullable|json'
        ]);
    
        $lineData = json_decode($request->input('lines'), true);
        $sizeData = json_decode($request->input('sizes'), true);
        
        if (empty($lineData)) {
            return response()->json(['success' => false, 'message' => 'Line pekerjaan tidak boleh kosong.'], 422);
        }
    
        try {
            DB::beginTransaction();
    
            // --- A. PERSIAPAN MOCKUP ---
            $newMockupPaths = [];
            if ($request->hasFile('mockups')) {
                foreach ($request->file('mockups') as $index => $file) {
                    $path = $file->store('mockups', 'public'); 
                    $newMockupPaths[] = ['file_path' => $path, 'order' => $index]; 
                }
            }
            $existingMockupUrls = json_decode($request->input('existing_mockup_urls'), true) ?? [];
            $existingMockupPaths = [];
            foreach ($existingMockupUrls as $index => $url) {
                $relativePath = str_replace(Storage::url(''), '', $url);
                $existingMockupPaths[] = ['file_path' => $relativePath, 'order' => $index];
            }
            $allMockupPaths = array_merge($existingMockupPaths, $newMockupPaths);
            
            // Hapus file fisik
            $mockupsToDeleteUrls = json_decode($request->input('mockups_to_delete'), true) ?? [];
            $pathsToDelete = [];
            foreach ($mockupsToDeleteUrls as $url) {
                $pathsToDelete[] = str_replace(Storage::url(''), '', $url);
            }
            if (!empty($pathsToDelete)) {
                Storage::disk('public')->delete($pathsToDelete);
            }

            // --- B. LOGIKA SMART UPDATE (ID TETAP) ---

            // 1. Ambil Data Lama
            $mainTask = Task::findOrFail($id);
            $noInvoice = $mainTask->no_invoice;
            // Ambil semua task terkait (urutkan by ID agar konsisten)
            $existingTasks = Task::where('no_invoice', $noInvoice)->orderBy('id', 'asc')->get();
            
            $updatedTasksCollection = []; 

            // 2. Loop Data dari Form
            foreach ($lineData as $index => $line) {
                
                // Cek: Apakah task lama di urutan ini masih ada?
                if (isset($existingTasks[$index])) {
                    // UPDATE task lama (ID tidak berubah)
                    $task = $existingTasks[$index];
                } else {
                    // BUAT task baru (jika user menambah line)
                    $task = new Task();
                    $task->user_id = auth()->id(); 
                    $task->status_id = 1; 
                }

                // Isi Data
                $task->no_invoice = $request->input('noInvoice'); 
                $task->nama_pelanggan = $request->input('namaPelanggan');
                $task->judul = $request->input('judul');
                $task->catatan = $request->input('catatan') ?? null;
                $task->urgensi = $request->input('urgensi');
                $task->total_jumlah = $request->input('jumlah');
                $task->warna = $request->input('warna') ?? null;
                $task->model = $request->input('model') ?? null;
                $task->bahan = $request->input('bahan') ?? null;
                $task->size_title = $sizeData['size_title'] ?? 'Size';
                $task->save(); 

                // --- UPDATE RELASI (Reset isi, pertahankan Task ID) ---

                // 1. Line Pekerjaan
                $task->taskPekerjaans()->delete(); 
                $taskLine = $task->taskPekerjaans()->create([ 
                    'nama_pekerjaan' => $line['nama'],
                    'deadline' => $line['deadline']
                ]);
                
                // 2. Checklist & Status
                $totalCheck = 0;
                $totalCompleted = 0;
                if (!empty($line['checklists'])) {
                    $checklists = [];
                    foreach ($line['checklists'] as $checkData) {
                        // Handle format data dari JS
                        if (is_array($checkData)) {
                            $name = $checkData['name'];
                            $isCompleted = $checkData['is_completed'] ?? 0;
                        } else {
                            $name = $checkData;
                            $isCompleted = 0;
                        }
                        $checklists[] = [ 'nama_checklist' => $name, 'is_completed' => $isCompleted ];
                        $totalCheck++;
                        if ($isCompleted) $totalCompleted++;
                    }
                    $taskLine->checklists()->createMany($checklists);
                }
                
                // Hitung ulang status otomatis
                if ($totalCheck > 0) {
                    $percentage = round(($totalCompleted / $totalCheck) * 100);
                    $newStatusName = 'Needs Work';
                    $completedAt = null;
                    if ($percentage === 100) {
                        $newStatusName = 'Done and Ready';
                        $completedAt = now();
                    } else if ($percentage > 0) {
                        $newStatusName = 'In Progress';
                    }
                    $statusObj = Status::where('name', $newStatusName)->first();
                    if ($statusObj) {
                        $task->status_id = $statusObj->id;
                        $task->completed_at = $completedAt;
                        $task->save();
                    }
                }

                // 3. Size (GUNAKAN CREATE)
                $task->taskSizes()->delete();
                if (!empty($sizeData) && !empty($sizeData['headers']) && !empty($sizeData['rows'])) {
                    $headers = $sizeData['headers'];
                    foreach ($sizeData['rows'] as $rowData) {
                        $jenis = $rowData['jenis'];
                        foreach ($headers as $tipe) {
                            $jumlah = $rowData['quantities'][$tipe] ?? 0;
                            if ($jumlah > 0) {
                                // ▼▼▼ FIX: Gunakan create() ▼▼▼
                                TaskSize::create([ 
                                    'task_id' => $task->id, 
                                    'jenis' => $jenis, 
                                    'tipe' => $tipe, 
                                    'jumlah' => (int) $jumlah
                                ]);
                            }
                        }
                    }
                }
                
                // 4. Mockup
                $task->mockups()->delete(); 
                if (!empty($allMockupPaths)) {
                    foreach ($allMockupPaths as $mockup) {
                        $task->mockups()->create([
                            'file_path' => $mockup['file_path'],
                            'order' => $mockup['order']
                        ]);
                    }
                }
                
                $updatedTasksCollection[] = $task;
            }

            // 5. HAPUS SISA TASK (Jika user mengurangi line saat edit)
            if (count($existingTasks) > count($lineData)) {
                $tasksToDelete = $existingTasks->slice(count($lineData));
                foreach ($tasksToDelete as $taskToDelete) {
                    $taskToDelete->delete();
                }
            }
        
            DB::commit();
            
            return response()->json([
                'success' => true, 
                'message' => 'Task berhasil diperbarui!',
                'tasks' => $updatedTasksCollection
            ]);
        
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui task: ' . $e->getMessage()], 500);
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
    // Di dalam TaskController.php

    /**
     * Menampilkan task yang sudah di-arsip.
     */
    public function showArchive()
    {
        $archivedTasks = Task::with('user', 'status', 'taskPekerjaans')
                            ->where('is_archived', true)
                            ->orderBy('updated_at', 'desc')
                            ->get();
                            
        return view('archive-sb', ['tasks' => $archivedTasks]);
    }

    /**
     * Menampilkan task yang ada di "Trash" (Soft Deleted).
     */
    public function showTrash()
    {
        $trashedTasks = Task::with('user', 'status', 'taskPekerjaans')
                           ->onlyTrashed() // <-- Ini mengambil HANYA yang di-trash
                           ->orderBy('deleted_at', 'desc')
                           ->get();
                           
        return view('trash-sb', ['tasks' => $trashedTasks]);
    }

    public function bulkAction(Request $request)
    {
        // 1. Update Validasi: Tambahkan aksi baru ke dalam 'in:...'
        $request->validate([
            'action' => 'required|string|in:archive,delete,unarchive_all,delete_permanent_all', 
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer|exists:tasks,id'
        ]);

        $taskIds = $request->input('task_ids');
        $action = $request->input('action');

        // --- AKSI DARI HALAMAN TASK UTAMA ---
        
        if ($action == 'archive') {
            // Set is_archived = true
            Task::whereIn('id', $taskIds)->update(['is_archived' => true]);
            return response()->json(['success' => true, 'message' => 'Task berhasil diarsipkan.']);
        
        } elseif ($action == 'delete') {
            // Soft Delete (Masuk ke Trash)
            Task::destroy($taskIds);
            return response()->json(['success' => true, 'message' => 'Task berhasil dipindah ke sampah.']);
        }

        // --- AKSI DARI HALAMAN ARCHIVE (BARU) ---

        elseif ($action == 'unarchive_all') {
            // Restore dari Archive (Set is_archived = false)
            Task::whereIn('id', $taskIds)->update(['is_archived' => false]);
            return response()->json(['success' => true, 'message' => 'Task berhasil dipulihkan dari arsip.']);
        
        } elseif ($action == 'delete_permanent_all') {
            // Hapus Permanen (Termasuk File Mockup)
            
            // Ambil data task dulu untuk hapus file fisiknya
            $tasks = Task::whereIn('id', $taskIds)->with('mockups')->get();
            
            foreach ($tasks as $task) {
                // Hapus file fisik mockup dari storage
                foreach ($task->mockups as $mockup) {
                    Storage::disk('public')->delete($mockup->file_path);
                }
                // Hapus permanen dari database
                $task->forceDelete();
            }
            return response()->json(['success' => true, 'message' => 'Task berhasil dihapus permanen.']);
        }

        return response()->json(['success' => false, 'message' => 'Aksi tidak valid.'], 400);
    }

    public function restore($id)
    {
        $task = Task::onlyTrashed()->findOrFail($id);
        
        $task->restore();

        return response()->json(['success' => true, 'message' => 'Task berhasil dipulihkan.']);
    }

    public function trashBulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:restore_all,delete_permanent_all',
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer' // Validasi bahwa semua item adalah angka
        ]);

        $taskIds = $request->input('task_ids');
        $action = $request->input('action');

        if ($action == 'restore_all') {
            
            // 1. Pulihkan (Restore)
            Task::onlyTrashed()->whereIn('id', $taskIds)->restore();
            
            return response()->json(['success' => true, 'message' => 'Task yang dipilih berhasil dipulihkan.']);
        
        } elseif ($action == 'delete_permanent_all') {
            
            // 2. Hapus Permanen (Force Delete)
            
            // Ambil task-nya dulu untuk menghapus file mockup
            $tasks = Task::onlyTrashed()->with('mockups')->whereIn('id', $taskIds)->get();
            
            foreach ($tasks as $task) {
                // Hapus file fisik dari storage
                foreach ($task->mockups as $mockup) {
                    Storage::disk('public')->delete($mockup->file_path);
                }
                // Hapus permanen dari database
                $task->forceDelete();
            }
            
            return response()->json(['success' => true, 'message' => 'Task berhasil dihapus permanen.']);
        }

        return response()->json(['success' => false, 'message' => 'Aksi tidak valid.'], 400);
    }

    public function unarchive($id)
    {
        $task = Task::findOrFail($id);
        
        $task->is_archived = false;
        $task->save();

        return response()->json(['success' => true, 'message' => 'Task berhasil dipulihkan dari arsip.']);
    }
<<<<<<< HEAD
=======
    
    public function clearNotifications()
    {
        Auth::user()->notifications()->delete();
        
        return response()->json(['success' => true, 'message' => 'Semua notifikasi dihapus.']);
    }

    public function getTaskRowHtml($id)
    {
        $task = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')->findOrFail($id);
        
        $html = view('partials.task-row', ['task' => $task])->render();
        
        return response()->json(['html' => $html]);
    }
    

    public function updateBahan(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        
        $task->update([
            'bahan_terpakai' => $request->bahan_terpakai,
            'bahan_reject'   => $request->bahan_reject
        ]);

        return response()->json(['success' => true, 'message' => 'Data bahan disimpan.']);
    }


    public function exportExcel(Request $request)
    {
        // Ambil ID dari query string ?ids=1,2,3
        $idsString = $request->query('ids');
        
        if (!$idsString) {
            return back()->with('error', 'Tidak ada task dipilih.');
        }

        $taskIds = explode(',', $idsString);

        // Download file excel dengan nama tasks_export_(tanggal).xlsx
        return Excel::download(new TasksExport($taskIds), 'tasks_export_' . date('Y-m-d_H-i') . '.xlsx');
    }
>>>>>>> task
}