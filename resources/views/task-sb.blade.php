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

        @if(Auth::user()->role == 'admin')
        <div class="title-page-actions">
            <button class="btn-select" id="selectToggleBtn">
                <i class="bi bi-check-square"></i> Pilih
            </button>
            <button class="btn-add" id="addBtn">
                <i class="bi bi-plus-lg"></i> Add new
            </button>
        </div>
        @endif
    </div>

    @if(Auth::user()->role == 'admin')
    <div class="bulk-action-bar" id="bulkActionBar" style="display: none;">
        <span id="bulkSelectCount">0 Task terpilih</span>
        <button id="bulkExportBtn" class="btn btn-success btn-sm" style="margin-right: 5px;">
            <i class="bi bi-file-earmark-excel-fill"></i> Export Excel
        </button>
        <button id="bulkArchiveBtn" class="btn btn-warning btn-sm">
            <i class="bi bi-archive-fill"></i> Arsipkan
        </button>
        <button id="bulkDeleteBtn" class="btn btn-danger btn-sm">
            <i class="bi bi-trash-fill"></i> Pindahkan ke Sampah
        </button>
    </div>
    @endif

    <div class="task">
    <table id="taskTable">
        @if(request()->has('sort'))
        <a href="{{ route('task') }}" class="reset-sort">
            <i class="bi bi-x-circle reset-sort-icon"></i> Reset Sort
        </a>
        @endif
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
    
            {{-- Panggil Partial untuk setiap task --}}
            @forelse($tasks as $task)
                @include('partials.task-row', ['task' => $task])
            @empty
            <tr id="emptyRow"> 
                <td colspan="12" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-6 d-block mb-2"></i>
                    Belum ada task yang tersedia.
                </td>
            </tr>
            @endforelse
        
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

                <div class="mb-3 position-relative"> 
                    <label for="namaPelanggan" class="form-label">Nama Pelanggan</label>
                    
                    <input type="text" class="form-control" id="namaPelanggan" name="namaPelanggan" 
                           placeholder="Ketik nama pelanggan..." autocomplete="off" required>
                    
                    <div class="autocomplete-results" id="customerSearchResults"></div>
                </div>
               

                <div class="mb-2">
                    <label>Judul</label>
                    <input type="text" id="judul" class="form-control" placeholder="Judul" required>
                </div>

                <div class="mb-2 position-relative pj-wrapper">
                    <label for="penanggungJawabInput">Penanggung Jawab</label>
                    
                    <div class="position-relative input-with-toggle">
                        <input type="text" id="penanggungJawabInput" class="form-control pj-input" placeholder="Ketik nama user..." autocomplete="off">
                        
                        <button class="toggle-search-btn" type="button" id="togglePjBtn">
                            <i class="bi bi-chevron-down"></i>
                        </button>
                
                        <div class="autocomplete-results pj-results" id="pjSearchResults"></div>
                    </div>
                </div>

                <div class="mb-2">
                    <label>Catatan</label>
                    <textarea id="catatan" class="form-control" placeholder="Catatan" rows="3"></textarea>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="urgensi" class="form-label">Urgensi</label>
                    <select class="form-select" id="urgensi" name="urgensi" required>

                        <option value="Normal" selected>Normal</option> 
                        <option value="Urgent">Urgent</option>
                    </select>
                    </div>
                </div>

         

                <hr>

                <h6>Line Pekerjaan & Checklist</h6>
                <div class="addjob">
                    <a href="#" id="addLine">+ Tambah Line Pekerjaan</a>
                </div>
          
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
                    
                    <input type="file" id="mockups" class="form-control" name="mockups[]" multiple accept="image/png, image/jpeg, image/jpg, image/webp">                    
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
@endpush