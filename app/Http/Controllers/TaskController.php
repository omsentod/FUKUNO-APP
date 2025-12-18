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
use App\Events\NewNotification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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

    $allowedSorts = [
        'no_invoice', 
        'judul', 
        'total_jumlah', 
        'urgensi',
        'nama_pelanggan', 
        'status',         
        'line',          
        'deadline'        
    ];


    $sortColumn = $request->query('sort', 'created_at');
    $sortOrder = $request->query('order', 'asc');

    if (!in_array($sortColumn, $allowedSorts) && $sortColumn != 'created_at') {
        $sortColumn = 'created_at';
    }
    if (!in_array($sortOrder, ['asc', 'desc'])) {
        $sortOrder = 'asc';
    }

    $query = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')
                 ->select('tasks.*')
                 ->where('is_archived', false); 
                 

    if ($sortColumn == 'status') {
        $query->join('statuses', 'tasks.status_id', '=', 'statuses.id')
              ->orderBy('statuses.name', $sortOrder);
              
            } elseif ($sortColumn == 'line') {
                $query->join('task_pekerjaans', 'tasks.id', '=', 'task_pekerjaans.task_id')
                      ->orderBy('task_pekerjaans.nama_pekerjaan', $sortOrder);
        
            } elseif ($sortColumn == 'deadline') {
                
                $query->join('task_pekerjaans', 'tasks.id', '=', 'task_pekerjaans.task_id')
                      ->join('statuses', 'tasks.status_id', '=', 'statuses.id');
        
           
                
                if ($sortOrder == 'asc') {
                    $query->orderByRaw("CASE WHEN statuses.name = 'Done and Ready' THEN 1 ELSE 0 END ASC");
                    $query->orderBy('task_pekerjaans.deadline', 'asc');
                } else {
                   
                    $query->orderByRaw("CASE WHEN statuses.name = 'Done and Ready' THEN 1 ELSE 0 END DESC");
                    $query->orderBy('task_pekerjaans.deadline', 'desc');
                }
            } else {
                $query->orderBy($sortColumn, $sortOrder);
            }
    
  $tasks = $query->get();
    
    $highlightId = $request->query('highlight');

    return view('task-sb', [
        'tasks' => $tasks,
        'highlightId' => $highlightId ?? null,
        'currentSort' => $sortColumn,   
        'currentOrder' => $sortOrder, 
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
        'penanggung_jawab' => 'nullable|string|max:100', 
        'mockups.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
    ], [
        'noInvoice.unique' => 'Gagal! No. PO ini sudah terdaftar di database.',
        'noInvoice.required' => 'No. PO wajib diisi.'
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

        // ==========================================================
        // TAHAP 1: PERSIAPAN GAMBAR (DILAKUKAN SEKALI SAJA)
        // ==========================================================
        $allMockupPaths = [];

        // A. Handle Gambar Baru (Upload Manual)
        if ($request->hasFile('mockups')) {
            foreach ($request->file('mockups') as $file) {
                $path = $file->store('mockups', 'public'); 
                $allMockupPaths[] = ['file_path' => $path];
            }
        }

        // B. Handle Gambar Duplikat (Copy Fisik dari Task Lama) - PERBAIKAN UTAMA
        if ($request->has('existing_mockup_urls')) {
            $existingUrls = json_decode($request->input('existing_mockup_urls'), true);

            if (!empty($existingUrls)) {
                foreach ($existingUrls as $url) {
                    // --- LOGIKA BARU: LEBIH PINTAR DETEKSI PATH ---
                    // Pecah string berdasarkan '/storage/' dan ambil bagian belakangnya
                    $parts = explode('/storage/', $url);
                    
                    if (count($parts) > 1) {
                        // Jika URL adalah "http://web.com/storage/mockups/gambar.jpg"
                        // Maka $relativePath jadi "mockups/gambar.jpg"
                        $relativePath = urldecode($parts[1]); // urldecode untuk menangani spasi (%20)
                    } else {
                        // Fallback jika format URL tidak standar, coba pakai URL aslinya
                        $relativePath = urldecode($url);
                    }

                    // Cek apakah file aslinya ada di storage
                    if (Storage::disk('public')->exists($relativePath)) {
                        // Buat nama file baru yang unik (Cloning)
                        $extension = pathinfo($relativePath, PATHINFO_EXTENSION);
                        $newFileName = 'mockups/' . Str::random(40) . '.' . $extension;

                        // COPY FILE FISIK
                        Storage::disk('public')->copy($relativePath, $newFileName);

                        // Masukkan ke array antrian simpan
                        $allMockupPaths[] = ['file_path' => $newFileName];
                    } 
                }
            }
        }

        // ==========================================================
        // TAHAP 2: LOOPING PEMBUATAN TASK
        // ==========================================================
        foreach ($lineData as $line) {
            
            $task = new Task();
            $task->no_invoice = $taskData['noInvoice'];
            $task->nama_pelanggan = $taskData['namaPelanggan'];
            $task->judul = $taskData['judul'];
            $task->penanggung_jawab = $request->input('penanggung_jawab');
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
            
            // Simpan Checklist
            if (!empty($line['checklists'])) {
                $checklists = [];
                foreach ($line['checklists'] as $index => $checkData) {
                    $name = is_array($checkData) ? $checkData['name'] : $checkData;
                    $checklists[] = [
                        'nama_checklist' => $name,
                        'is_completed' => false, 
                        'position' => $index + 1 
                    ];
                }
                $taskLine->checklists()->createMany($checklists);
            }

            // Simpan Data Size
            if (!empty($sizeData) && !empty($sizeData['headers']) && !empty($sizeData['rows'])) {
                $headers = $sizeData['headers'];
                foreach ($sizeData['rows'] as $rowData) {
                    $jenis = $rowData['jenis'];
                    foreach ($headers as $tipe) {
                        $jumlah = $rowData['quantities'][$tipe] ?? 0;
                        if ($jumlah > 0) {
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
            
            // ▼▼▼ SIMPAN RELASI MOCKUP (Memakai array yang sudah disiapkan di atas) ▼▼▼
            if (!empty($allMockupPaths)) {
                $task->mockups()->createMany($allMockupPaths);
            }
            
            $createdTasks[] = Task::with('user', 'status', 'mockups', 'taskPekerjaans.checklists')->find($task->id);
        }

        // ==========================================================
        // TAHAP 3: NOTIFIKASI
        // ==========================================================
        $usersToNotify = User::where('id', '!=', auth()->id())->get();
    
        if (count($createdTasks) > 0) {
            $firstTask = $createdTasks[0]; 

            Notification::send($usersToNotify, new TaskCreated($firstTask, auth()->user()));
 
            foreach ($usersToNotify as $targetUser) {
                $notifData = [
                    'message'          => auth()->user()->name . " membuat task baru: " . Str::limit($firstTask->judul, 20),
                    'url'              => route('task', ['highlight' => $firstTask->id]),
                    'creator_initials' => auth()->user()->initials,     
                    'creator_color'    => auth()->user()->avatar_color, 
                    'first_mockup_url' => $firstTask->mockups->first() ? Storage::url($firstTask->mockups->first()->file_path) : null,
                    'time'             => 'Baru saja',
                    'creator_name'     => Auth::user()->name,
                    'task_title'       => $task->judul, 
                    'comment_body'     => null,
                    'type'             => 'new_task',     
                    'task_id'          => $firstTask->id,
                ];
                
                event(new NewNotification($notifData, $targetUser->id));
            }
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

    
    
    public function markNotificationsAsRead(Request $request)
    {
        Auth::user()->unreadNotifications->markAsRead();
        
        return response()->json(['success' => true]);
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
    $request->validate(['is_completed' => 'required|boolean']);

    $checklist = TaskChecklist::find($id);
    if (!$checklist) {
        return response()->json(['success' => false, 'message' => 'Checklist not found.'], 404);
    }
    
    $checklist->is_completed = $request->input('is_completed');
    $checklist->save();

    $task = $checklist->taskPekerjaan->task;

    // Cek Hold
    if ($task->status->name == 'Hold') {
        // Tetap kirim update row real-time agar user lain melihat checklist tercentang
        $this->sendRowUpdateNotification($task, "mengupdate checklist task");
        return response()->json(['success' => true, 'message' => 'Checklist updated (Task Hold).']);
    }

    // Hitung Ulang
    $task->load('taskPekerjaans.checklists'); 
    $allChecklists = $task->taskPekerjaans->flatMap->checklists;
    $total = $allChecklists->count();
    $completed = $allChecklists->where('is_completed', true)->count();
    $percentage = ($total > 0) ? (int) round(($completed / $total) * 100) : 0;

    // Update Status Otomatis
    $newStatusName = 'To Do';
    if ($percentage === 100) {
        $newStatusName = 'Done and Ready';
        $task->completed_at = now();
    } else if ($percentage > 0) {
        $newStatusName = 'In Progress';
        $task->completed_at = null;
    } else {
        $task->completed_at = null; 
    }

    $newStatus = Status::where('name', $newStatusName)->first();
    if ($newStatus && $task->status_id != $newStatus->id) {
        $task->status_id = $newStatus->id;
        $task->save();
    }

    // --- KIRIM NOTIFIKASI REAL-TIME ---
    // Saya buat fungsi helper kecil di bawah agar tidak duplikat kode
    $this->sendRowUpdateNotification($task, "mengupdate progress task ($percentage%)");

    return response()->json([
        'success' => true, 
        'message' => 'Checklist and Status updated!',
        'new_percentage' => $percentage
    ]);
}


    public function show($id)
    {
        // 1. Temukan task utama yang diklik
        $mainTask = Task::withTrashed()->findOrFail($id);

        // 2. Dapatkan No. PO-nya
        $noPo = $mainTask->no_invoice;

        // 3. Ambil SEMUA task (termasuk dirinya sendiri) yang punya No. PO yang sama
        $query = Task::with('user', 'status', 'taskPekerjaans.checklists', 'mockups', 'taskSizes')
                     ->where('no_invoice', $noPo)
                     ->orderBy('created_at', 'asc');

        if ($mainTask->trashed()) {
            $query->withTrashed();
        }
        $allTasksInGroup = $query->get();

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

        foreach ($usersToNotify as $targetUser) {
            
            $notifData = [
                'message'          => Auth::user()->name . " mengomentari: " . Str::limit($task->judul, 20),
                'url'              => route('task.show', $task->id) . '#content-activity',
                'creator_initials' => Auth::user()->initials,
                'creator_color'    => Auth::user()->avatar_color,
                'first_mockup_url' => $task->mockups->first() ? Storage::url($task->mockups->first()->file_path) : null,
                'time'             => 'Baru saja',
                'creator_name'     => Auth::user()->name,
                'task_title'       => $task->judul,
                'comment_body'     => $comment->body,
                'type'             => 'new_comment', 
                'task_id'          => $task->id
            ];

            event(new NewNotification($notifData, $targetUser->id));
        }

        return response()->json(['success' => true, 'comment' => $comment]);
    }
    
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status_name' => 'required|string']);
        
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task not found.'], 404);
        }
        
        $statusNameInput = $request->status_name;
        
        // Mapping nama khusus jika ada
        if ($statusNameInput == 'Resume Progress') {
            $statusNameInput = 'In Progress'; 
        }
        
        $newStatus = Status::where('name', $statusNameInput)->first();
        
        if (!$newStatus) {
            return response()->json(['success' => false, 'message' => "Status '$statusNameInput' not found."], 404);
        }
        
        // Update Data
        $task->status_id = $newStatus->id;
        if (in_array($statusNameInput, ['Done and Ready', 'Delivered'])) {
            $task->completed_at = now();
        } else if ($statusNameInput != 'Hold') { 
            $task->completed_at = null; 
        }
        $task->save();
        
        // --- TAMBAHAN REAL-TIME START ---
        $usersToNotify = User::where('id', '!=', Auth::id())->get();
        foreach ($usersToNotify as $targetUser) {
            $notifData = [
                'message'          => 'silent_update',
                'type'             => 'task_updated_row', // <--- TIPE BARU (Update Row)
                'task_id'          => $task->id,
                
                // Dummy Data (Wajib ada biar JS gak error)
                'url'              => route('task', ['highlight' => $task->id]),
                'creator_initials' => Auth::user()->initials ?? '??',
                'creator_color'    => Auth::user()->avatar_color ?? '#ccc',
                'first_mockup_url' => null,
                'time'             => 'Baru saja',
                'creator_name'     => Auth::user()->name,
                'task_title'       => $task->judul,
                'comment_body'     => null
            ];
            event(new NewNotification($notifData, $targetUser->id));
        }
        // --- TAMBAHAN REAL-TIME END ---
        
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
                $task->penanggung_jawab = $request->input('penanggung_jawab');
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
    
                foreach ($line['checklists'] as $index => $checkData) {
        
                if (is_array($checkData)) {
                $name = $checkData['name'];
                $isCompleted = $checkData['is_completed'] ?? 0;
                } else {
                $name = $checkData;
                $isCompleted = 0;
                }

                $checklists[] = [ 
                'nama_checklist' => $name, 
                'is_completed' => $isCompleted,
                'position' => $index + 1 
                ];

                 $totalCheck++;
                if ($isCompleted) $totalCompleted++;
        }
    
    // Simpan semua checklist beserta posisi barunya
    $taskLine->checklists()->createMany($checklists);
                }
                
                // Hitung ulang status otomatis
                if ($totalCheck > 0) {
                    $percentage = round(($totalCompleted / $totalCheck) * 100);
                    $newStatusName = 'To Do';
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
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Task tidak ditemukan.'], 404);
        }
    
        try {
            $taskId = $task->id;
            $taskTitle = $task->judul;
            
            // Hapus task
            $task->delete();
    
            // --- TAMBAHAN REAL-TIME START ---
            $usersToNotify = User::where('id', '!=', Auth::id())->get();
            
            foreach ($usersToNotify as $targetUser) {
                $notifData = [
                    'message' => 'silent_update',
                    'type'    => 'task_deleted', // <--- PENTING UNTUK JS
                    'task_id' => $taskId,
                    'url' => '#', 'creator_initials' => '??', 'creator_color' => '#ccc', 
                    'first_mockup_url' => null, 'time' => 'Baru saja', 'creator_name' => Auth::user()->name, 
                    'task_title' => $taskTitle, 'comment_body' => null
                ];
                // Kirim Sinyal Pusher
                event(new NewNotification($notifData, $targetUser->id));
            }
            // --- TAMBAHAN REAL-TIME END ---
    
            return response()->json(['success' => true, 'message' => 'Task berhasil dihapus.']);
    
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal menghapus task: ' . $e->getMessage()], 500);
        }
    }



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
        $request->validate([
            'action' => 'required|string|in:archive,delete,unarchive_all,delete_permanent_all', 
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer|exists:tasks,id'
        ]);
    
        $taskIds = $request->input('task_ids');
        $action = $request->input('action');
        $usersToNotify = User::where('id', '!=', Auth::id())->get();
    
        // --- LOGIKA UTAMA ---
    
        if ($action == 'archive') {
            // 1. Update DB Massal (Cepat)
            Task::whereIn('id', $taskIds)->update(['is_archived' => true]);
    
            // 2. Kirim Notifikasi Loop (Agar JS user lain update per baris)
            foreach ($taskIds as $tid) {
                foreach ($usersToNotify as $targetUser) {
                    $notifData = [
                        'message' => Auth::user()->name . " mengarsipkan task.",
                        'type'    => 'task_archived', 
                        'task_id' => $tid,
                        'url' => '#', 'creator_initials' => '??', 'creator_color' => '#ccc', 'first_mockup_url' => null, 'time' => 'Baru saja', 'creator_name' => Auth::user()->name, 'task_title' => 'Bulk Action', 'comment_body' => null
                    ];
                    event(new NewNotification($notifData, $targetUser->id));
                }
            }
            return response()->json(['success' => true, 'message' => 'Task berhasil diarsipkan.']);
        
        } elseif ($action == 'delete') {
            // 1. Soft Delete Massal
            Task::destroy($taskIds);
    
            // 2. Kirim Notifikasi Loop
            foreach ($taskIds as $tid) {
                foreach ($usersToNotify as $targetUser) {
                    $notifData = [
                        'message' => 'silent_update',
                        'type'    => 'task_deleted',
                        'task_id' => $tid,
                        'url' => '#', 'creator_initials' => '??', 'creator_color' => '#ccc', 'first_mockup_url' => null, 'time' => 'Baru saja', 'creator_name' => Auth::user()->name, 'task_title' => 'Bulk Action', 'comment_body' => null
                    ];
                    event(new NewNotification($notifData, $targetUser->id));
                }
            }
            return response()->json(['success' => true, 'message' => 'Task berhasil dipindah ke sampah.']);
        }
    
    
        elseif ($action == 'unarchive_all') {
        
            $tasksToRestore = Task::whereIn('id', $taskIds)->get();
    
            Task::whereIn('id', $taskIds)->update(['is_archived' => false]);
    
    
            foreach ($tasksToRestore as $task) {
                foreach ($usersToNotify as $targetUser) {
                    
                    $notifData = [
                        'message'          => 'silent_update',
                        'type'             => 'task_restored', 
                        'task_id'          => $task->id,
                        'url'              => route('task', ['highlight' => $task->id]), 
                        
                        'creator_initials' => Auth::user()->initials ?? '??',
                        'creator_color'    => Auth::user()->avatar_color ?? '#ccc',
                        'first_mockup_url' => $task->mockups->first() ? Storage::url($task->mockups->first()->file_path) : null,
                        'time'             => 'Baru saja',
                        'creator_name'     => Auth::user()->name,
                        'task_title'       => $task->judul,
                        'comment_body'     => null
                    ];
    
                    event(new NewNotification($notifData, $targetUser->id));
                }
            }
    
            return response()->json(['success' => true, 'message' => 'Task berhasil dipulihkan dari arsip.']);
        
        }
    }

    public function restore($id)
    {
        $task = Task::onlyTrashed()->findOrFail($id);
        $task->restore();
    
        $usersToNotify = User::where('id', '!=', Auth::id())->get();
        
        foreach ($usersToNotify as $targetUser) {
            $notifData = [
                'message' => 'silent_update',
                'type'    => 'task_restored',
                'task_id' => $task->id,
                'url'     => route('task', ['highlight' => $task->id]),
                'creator_initials' => Auth::user()->initials, 'creator_color' => Auth::user()->avatar_color,
                'first_mockup_url' => null, 'time' => 'Baru saja', 'creator_name' => Auth::user()->name,
                'task_title' => $task->judul, 'comment_body' => null
            ];
            event(new NewNotification($notifData, $targetUser->id));
        }
    
        return response()->json(['success' => true, 'message' => 'Task berhasil dipulihkan.']);
    }



    public function trashBulkAction(Request $request)
{
    $request->validate([
        'action' => 'required|string|in:restore_all,delete_permanent_all',
        'task_ids' => 'required|array',
        'task_ids.*' => 'integer'
    ]);

    $taskIds = $request->input('task_ids');
    $action = $request->input('action');
    
    // Siapkan user yang akan menerima update real-time
    $usersToNotify = User::where('id', '!=', Auth::id())->get();

    if ($action == 'restore_all') {
        
        // 1. Eksekusi Restore di Database (Massal)
        Task::onlyTrashed()->whereIn('id', $taskIds)->restore();
        

        $restoredTasks = Task::whereIn('id', $taskIds)->with('mockups')->get();

        foreach ($restoredTasks as $task) {
            foreach ($usersToNotify as $targetUser) {
                $notifData = [
                    'message'          => 'silent_update',
                    'type'             => 'task_restored', // Sinyal ke JS untuk "Tambah Baris"
                    'task_id'          => $task->id,
                    'url'              => route('task', ['highlight' => $task->id]),
                    
                    // Data Lengkap untuk merender baris tabel di sisi Client
                    'creator_initials' => Auth::user()->initials ?? '??',
                    'creator_color'    => Auth::user()->avatar_color ?? '#ccc',
                    'first_mockup_url' => $task->mockups->first() ? Storage::url($task->mockups->first()->file_path) : null,
                    'time'             => 'Baru saja',
                    'creator_name'     => Auth::user()->name,
                    'task_title'       => $task->judul,
                    'comment_body'     => null
                ];
                
                // Kirim Event Real-time
                event(new NewNotification($notifData, $targetUser->id));
            }
        }
        
        return response()->json(['success' => true, 'message' => 'Task yang dipilih berhasil dipulihkan.']);
    
    } elseif ($action == 'delete_permanent_all') {
        
        // 2. Hapus Permanen (Force Delete)
        // Kita perlu get dulu sebelum hapus untuk membersihkan file fisik
        $tasks = Task::onlyTrashed()->with('mockups')->whereIn('id', $taskIds)->get();
        
        foreach ($tasks as $task) {
            // A. Hapus file fisik dari storage
            foreach ($task->mockups as $mockup) {
                Storage::disk('public')->delete($mockup->file_path);
            }

            // B. Hapus notifikasi terkait di DB agar bersih
            DB::table('notifications')
                ->whereJsonContains('data->task_id', $task->id)
                ->delete();

            // C. Hapus permanen dari database
            $task->forceDelete();
        }

        
        return response()->json(['success' => true, 'message' => 'Task dan notifikasi terkait berhasil dihapus permanen.']);
    }

    return response()->json(['success' => false, 'message' => 'Aksi tidak valid.'], 400);
    }

    public function unarchive($id)
    {
        $task = Task::findOrFail($id);
        $task->is_archived = false;
        $task->save();
    
        $usersToNotify = User::where('id', '!=', Auth::id())->get();
        foreach ($usersToNotify as $targetUser) {
            $notifData = [
                'message' => 'silent_update',
                'type'    => 'task_restored', 
                'task_id' => $task->id,
                'url'     => route('task', ['highlight' => $task->id]),
                'creator_initials' => Auth::user()->initials, 'creator_color' => Auth::user()->avatar_color,
                'first_mockup_url' => null, 'time' => 'Baru saja', 'creator_name' => Auth::user()->name,
                'task_title' => $task->judul, 'comment_body' => null
            ];
            event(new NewNotification($notifData, $targetUser->id));
        }
    
        return response()->json(['success' => true, 'message' => 'Task berhasil dipulihkan dari arsip.']);
    }
    
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


    private function sendRowUpdateNotification($task, $actionMessage) {
        $usersToNotify = User::where('id', '!=', Auth::id())->get();
        foreach ($usersToNotify as $targetUser) {
            $notifData = [
                'message' => 'silent_update', // PASTIKAN PAKAI UNDERSCORE
                'type'    => 'task_updated_row',
                'task_id' => $task->id,
                'url'     => '#', 'creator_initials' => '??', 'creator_color' => '#ccc', 'first_mockup_url' => null, 'time' => 'Baru saja', 'creator_name' => Auth::user()->name, 'task_title' => $task->judul, 'comment_body' => null
            ];
            event(new NewNotification($notifData, $targetUser->id));
        }
    }

    public function searchUsers(Request $request)
    {
        $query = $request->get('query');
    
        if (empty($query)) {
            
            $users = User::select('id', 'name') 
                         ->limit(10)
                         ->get();
        } else {
            $users = User::where('name', 'LIKE', "%{$query}%")
                         ->select('id', 'name') // <--- Di sini juga diubah
                         ->limit(10)
                         ->get();
        }
    
        return response()->json($users);
    }

    public function searchCustomers(Request $request)
{
    $query = $request->get('query');

    
    $customers = Task::where('nama_pelanggan', 'LIKE', "%{$query}%")
                    ->select('nama_pelanggan')
                    ->distinct() 
                    
                    ->get();

    return response()->json($customers);
}
}