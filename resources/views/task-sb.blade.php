@extends('layouts.nav-side')

@section('title', 'Task') 

@php
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use Carbon\Carbon;
    use Illuminate\Support\Facades\Auth;

$user = Auth::user();
$initials = '';

if ($user && $user->name) {
    $words = explode(' ', $user->name);
    $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
}

// --- Logika Warna HSL BARU ---
$firstLetter = strtoupper(substr($initials ?? 'A', 0, 1)); // Default 'A'
$letterValue = ord($firstLetter) - ord('A'); // 0-25
$hue = ($letterValue * 14) % 360; // Hitung Hue
$bgColor = "hsl({$hue}, 65%, 40%)"; // Format HSL
// --
@endphp

@section('content')

<div class="page" data-user-name="{{ Auth::user()?->name }}">
    <div class="title-page">
    <div class="tp-1">
        <h2>Task</h2> 
        <div class="search-container mb-3">
            <div class="input-with-icon">
                <i class="bi bi-search search-icon"></i>
            <input type="text" id="taskSearchInput" class="form-control" placeholder="Cari">
        </div>
    </div>
        </div>
        
        <div class="title-page-actions">
            <button class="btn-select" id="selectToggleBtn">
                <i class="bi bi-check-square"></i> Pilih
            </button>
            <button class="btn-add" id="addBtn">
                <i class="bi bi-plus-lg"></i> Add new
            </button>
        </div>
    </div>

    <div class="bulk-action-bar" id="bulkActionBar" style="display: none;">
        <span id="bulkSelectCount">0 Task terpilih</span>
        <button id="bulkArchiveBtn" class="btn btn-warning btn-sm">
            <i class="bi bi-archive-fill"></i> Arsipkan
        </button>
        <button id="bulkDeleteBtn" class="btn btn-danger btn-sm">
            <i class="bi bi-trash-fill"></i> Pindahkan ke Sampah
        </button>
    </div>

    <div class="task">
    <table id="taskTable">
        <thead>            
            <tr>
                <th class="select-col" style="width: 10px;"><input type="checkbox" id="selectAllCheckbox"></th>
                <th>
                    @php $newOrder = ($currentSort == 'no_invoice' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'no_invoice', 'order' => $newOrder]) }}">
                        No. PO
                        @if($currentSort == 'no_invoice') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>
                
                <th>
                    @php $newOrder = ($currentSort == 'judul' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'judul', 'order' => $newOrder]) }}">
                        Tasks Title
                        @if($currentSort == 'judul') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>

                <th>
                    @php $newOrder = ($currentSort == 'total_jumlah' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'total_jumlah', 'order' => $newOrder]) }}">
                        Jumlah
                        @if($currentSort == 'total_jumlah') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>
                
                <th>
                    @php $newOrder = ($currentSort == 'line' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'line', 'order' => $newOrder]) }}">
                        Line Pekerjaan
                        @if($currentSort == 'line') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>

                <th>
                    @php $newOrder = ($currentSort == 'urgensi' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'urgensi', 'order' => $newOrder]) }}">
                        Urgent
                        @if($currentSort == 'urgensi') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>

                <th>
                    @php $newOrder = ($currentSort == 'status' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'status', 'order' => $newOrder]) }}">
                        Status
                        @if($currentSort == 'status') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>

                <th>
                    @php $newOrder = ($currentSort == 'deadline' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'deadline', 'order' => $newOrder]) }}">
                        Time Left
                        @if($currentSort == 'deadline') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>

                <th>Mockup</th>

                <th>
                    @php $newOrder = ($currentSort == 'nama_pelanggan' && $currentOrder == 'asc') ? 'desc' : 'asc'; @endphp
                    <a href="{{ route('task', ['sort' => 'nama_pelanggan', 'order' => $newOrder]) }}">
                        Klien
                        @if($currentSort == 'nama_pelanggan') <i class="bi {{ $currentOrder == 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill' }}"></i> @endif
                    </a>
                </th>
                
                <th>Progress</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody class="table-bg">


            @foreach($tasks as $task)
            @php
                $linePekerjaan = $task->taskPekerjaans->first();
                
                        // Ambil checklist HANYA dari line pekerjaan ini
                        $allChecklists = $linePekerjaan ? $linePekerjaan->checklists : collect();
                        $completed = $allChecklists->where('is_completed', true)->count();
                        $total = $allChecklists->count();
                        $percentage = ($total > 0) ? round(($completed / $total) * 100) : 0;

                        $isDone = ($task->status->name == 'Done and Ready' || $percentage == 100);
            @endphp
                <tr class="clickable-row" 
                data-url="{{ route('task.show', $task->id) }}"
                {!! ($highlightId ?? null) == $task->id ? 'id="highlight-task"' : '' !!} >
                <td class="select-col">
                    <input type="checkbox" class="row-checkbox" data-id="{{ $task->id }}">
                </td>
                <td>{{ $task->no_invoice }}</td>
                <td>{{ $task->judul }}</td>
                <td>{{ $task->total_jumlah }}</td>
    
                <td>
                    <button class="line-btn" style="background-color: #3498db; color: #ffff;">
                        {{ $linePekerjaan ? $linePekerjaan->nama_pekerjaan : 'N/A' }}
                    </button>
                </td>
    
                <td>{{ $task->urgensi }}</td>
                
                <td>
                    <div class="dropdown">
                        <button class="status-btn status-{{ Str::slug($task->status->name) }} dropdown-toggle" type="button" id="statusDropdown{{ $task->id }}"  data-task-id="{{ $task->id }}" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="status-text">{{ $task->status->name }}</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="statusDropdown{{ $task->id }}">
                            @if($task->status->name == 'Hold')
                                <a class="dropdown-item" href="#" data-status="Resume Progress"><i class="bi bi-play-circle"></i> Resume Progress</a>
                            @else
                                <a class="dropdown-item" href="#" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>
                            @endif
                        </div>
                    </div>
                </td>
    
                <td>
                    @php
                        // (Asumsi $linePekerjaan dan $isDone sudah dihitung di atas <tr>)
                        $timeLeftString = '-';
                        $timeClass = ''; 
                        $deadlineISO = $linePekerjaan && $linePekerjaan->deadline ? \Carbon\Carbon::parse($linePekerjaan->deadline)->toIso8601String() : '';
    
                        if ($isDone) {
                            // --- LOGIKA KEMBALI KE SEDERHANA ---
                            $timeLeftString = 'Selesai';
                            $timeClass = 'time-completed'; // Hijau
                        
                        } elseif ($linePekerjaan && $linePekerjaan->deadline) {
                            // --- LOGIKA JIKA BELUM SELESAI (HITUNG MUNDUR) ---
                            $deadline = \Carbon\Carbon::parse($linePekerjaan->deadline);
                            $rawTimeLeft = $deadline->diffForHumans();
                            $timeLeftString = str_replace(['dari sekarang', 'sebelumnya'], ['lagi', 'lalu'], $rawTimeLeft);
    
                            if ($deadline->isPast()) {
                                // 1. Jika sudah lewat: KUNING
                                $timeClass = 'time-late'; 
                            } 
                            elseif ($deadline->lte(now()->addDays(2))) {
                                // 2. Jika kurang dari 2 hari lagi: MERAH
                                $timeClass = 'time-mustdo'; 
                            }
                        }
                    @endphp
                    
                    <span id="time-left-{{ $task->id }}" class="{{ $timeClass }}" data-deadline="{{ $deadlineISO }}">
                        {{ $timeLeftString }}
                    </span>
                </td>
                <td class="icon-cell">
                    <div class="mockup-wrapper">
                        @foreach($task->mockups as $mockup)
                            <img src="{{ Storage::url($mockup->file_path) }}" class="mockup-image-data">
                        @endforeach
                        <img src="{{ $task->mockups->first() ? Storage::url($task->mockups->first()->file_path) : asset('assets/img/default.png') }}" class="mockup-display">
                        <i class="bi bi-stack gallery-indicator {{ $task->mockups->count() > 1 ? 'visible' : '' }}"></i>
                    </div>
                </td>
                
                <td>{{ $task->nama_pelanggan }}</td>
                
                <td>
              
                    <div class="dropdown">
                        <button class="progress dropdown-toggle" type="button" id="progressDropdown{{ $task->id }}" data-task-id="{{ $task->id }}" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="progress-text">{{ $percentage }}%</span>
                        </button>
                        <div class="dropdown-menu p-3" aria-labelledby="progressDropdown{{ $task->id }}" style="width: 250px;">
                            <form class="progress-form">
                                @forelse($allChecklists as $checklist)
                                    <div class="form-check">
                                        <input class="form-check-input progress-check" type="checkbox" 
                                               id="check-{{ $checklist->id }}" 
                                               data-id="{{ $checklist->id }}" 
                                               {{ $checklist->is_completed ? 'checked' : '' }}>
                                        <label class="form-check-label" for="check-{{ $checklist->id }}">
                                            {{ $checklist->nama_checklist }}
                                        </label>
                                    </div>
                                @empty
                                    <p class="text-muted small">Belum ada checklist.</p>
                                @endforelse
                            </form>
                        </div>
                    </div>
                </td>
                
                <td class="icon-cell">
                    <i class="bi bi-pencil-square icon-edit" data-id="{{ $task->id }}"></i>
                    <i class="bi bi-cloud-download-fill icon-download" data-id="{{ $task->id }}"></i>
                    <i class="bi bi-trash3-fill icon-trash" data-id="{{ $task->id }}"></i>
                </td>
            </tr>
        @endforeach
</tbody>
</table>
</div>
   </div>

  
    <!-- Popup Form -->
    <div class="popup-overlay" style="display: none;">
        <div class="popup">
            <h5 class="mb-3">Tambah Task Baru</h5>
            <form id="taskForm">
                <div class="mb-2">
                    <label>No Invoice</label>
                    <input type="text" id="noInvoice" class="form-control" placeholder="No. Invoice" required>
                </div>

                <div class="mb-2">
                    <label>Nama Pelanggan</label>
                    <input type="text" id="namaPelanggan" class="form-control" placeholder="Nama Pelanggan" required>
                </div>

                <div class="mb-2">
                    <label>Judul</label>
                    <input type="text" id="judul" class="form-control" placeholder="Judul" required>
                </div>

                <div class="mb-2">
                    <label>Catatan</label>
                    <textarea id="catatan" class="form-control" placeholder="Catatan" rows="3"></textarea>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label>Urgensi</label>
                        <select id="urgensi" class="form-select">
                            <option value="">Pilih</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Normal">Normal</option>
                        </select>
                    </div>
                </div>

                <hr>

                <h6>Line Pekerjaan & Checklist</h6>
                <a href="#" id="addLine" class="text-primary small mb-2 d-inline-block">+ Tambah Line Pekerjaan</a>
                <div id="lineContainer"></div>

                <hr>
                <h6>Jenis & Size</h6>
                <p class="small text-muted">Klik kanan pada tabel untuk menambah/menghapus baris atau kolom.</p>
                <div class="table-responsive">
                    <table class="table table-bordered text-center align-middle" id="sizeTable">
                        <thead class="table-danger">
                            <tr>
                                <th>Size</th> <th>Panjang</th> <th>Pendek</th> <th>Jumlah</th> </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" class="form-control" placeholder="Input size"></td>
                                <td><input type="text" class="form-control quantity-input" placeholder="0"></td>
                                <td><input type="text" class="form-control quantity-input" placeholder="0"></td>
                                <td class="row-total">0</td> </tr>
                            </tbody>
                        <tfoot>
                            <tr class="table-secondary fw-bold">
                                <td>Total</td>
                                <td class="column-total">0</td> <td class="column-total">0</td> <td class="grand-total">0</td> </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div id="customContextMenu" class="context-menu shadow-lg">
                    <div class="context-menu-item" data-action="insert-row-after">Tambah Baris di Bawah</div>
                    <div class="context-menu-item text-danger" data-action="delete-row">Hapus Baris Ini</div>
                    <hr>
                    <div class="context-menu-item" data-action="insert-col-right">Sisipkan Kolom Kanan</div>
                    <div class="context-menu-item text-danger" data-action="delete-col">Hapus Kolom Ini</div>
                </div>




                <div class="row mb-2">
                    <div class="col-md-6">
                        <label>Warna</label>
                        <input type="text" id="warna" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label>Model</label>
                        <input type="text" id="model" class="form-control">
                    </div>
                </div>

                <div class="mb-2">
                    <label>Bahan</label>
                    <input type="text" id="bahan" class="form-control">
                </div>

                <div class="mb-3">
                    <label for="mockups" class="form-label">Mockup</label>
                    
                    <input type="file" id="mockups" class="form-control" name="mockups[]" multiple>
                    
                    <div id="mockup-preview-area" class="mt-2" style="font-size: 14px;">
                        </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
            </form>

        </div>
    </div>
    {{-- end pop up --}}
    

    {{-- mockup modal --}}
    <div class="image-modal" id="imageCarouselModal" style="display: none;">
        <span class="modal-close" id="modalCloseBtn">&times;</span>
        <button class="modal-nav prev" id="modalPrevBtn">&#10094;</button>
        <button class="modal-nav next" id="modalNextBtn">&#10095;</button>
        <div class="modal-content">
            <img src="" id="modalImage" alt="Mockup Carousel">
        </div>
    </div>
    {{-- end pop up --}}
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/task.css') }}">
@endpush



@push('scripts')
    <script src="{{ asset('js/task.js') }}"></script>
@endpush