@extends('layouts.nav-side')
@section('title', 'Task Detail')

@php
    use Illuminate\Support\Facades\Storage;
    use Carbon\Carbon;
@endphp

@section('content')
<div class="page" data-user-name="{{ Auth::user()->name }}">
  <div class="detail-task-container">

    <div class="task-header">
      @php
          $backUrl = route('task'); // Default ke Task
          if (request('from') == 'archive') {
              $backUrl = route('archive');
          } elseif (request('from') == 'trash') {
              $backUrl = route('trash');
          }
      @endphp
      
      <a href="{{ $backUrl }}" class="back-btn"><i class="bi bi-arrow-left"></i></a>
      
      <h2>{{ $mainTask->judul }}</h2>
    </div>

    <div class="task-tabs">
      <button id="tab-detail" class="tab active">Task Detail</button>
      <button id="tab-activity" class="tab">Activities/Timeline</button>
    </div>

    {{-- ===== TAB 1: TASK DETAIL ===== --}}
    <div id="content-detail" class="tab-content active">
      <div class="task-detail-table">
        <div class="left-section">
          <table>
            <tr>
                <th>No. PO</th><td>{{ $mainTask->no_invoice }}</td>
                <th>Tanggal Mulai</th><td>{{ $mainTask->created_at->format('j M Y') }}</td>
            </tr>
            <tr>
                <th>Klien</th><td>{{ $mainTask->nama_pelanggan }}</td>
                
                @php
                    $latestDeadline = $allTasksInGroup->flatMap->taskPekerjaans->max('deadline');
                @endphp
                <th>Tanggal Selesai</th>
                <td>{{ $latestDeadline ? Carbon::parse($latestDeadline)->format('j M Y') : '-' }}</td>
            </tr>
            <tr>
                <th>Article / Model</th><td colspan="3">{{ $mainTask->model ?? '-' }}</td>
            </tr>
            <tr>
                <th>Material</th><td colspan="3">{{ $mainTask->bahan ?? '-' }}</td>
            </tr>
            <tr>
                <th>Line Pekerjaan</th>
                <td colspan="3">
                    {{ $allTasksInGroup->flatMap->taskPekerjaans->pluck('nama_pekerjaan')->implode(', ') }}
                </td>
            </tr>
            <tr>
                <th>Penanggung Jawab</th><td colspan="3">{{ $mainTask->user->name }}</td>
            </tr>
          </table>

          <div class="spec-note">
            <div class="spec">
              <h4>Spesifikasi</h4>
              <table>
                <tr><th>Warna</th><td>{{ $mainTask->warna ?? '-' }}</td></tr>
                <tr><th>Printing</th><td>-</td></tr>
                <tr><th>Bording</th><td>-</td></tr>
              </table>
            </div>
            <div class="note">
              <h4>Note</h4>
              <textarea readonly>{{ $mainTask->catatan ?? 'Tidak ada catatan.' }}</textarea>
            </div>
          </div>

          <div class="size-table">
            <h4>Rincian Ukuran</h4>
            <table>
              <thead>
                <tr>
                  <th>{{ $mainTask->size_title ?? 'Size' }}</th>
                    @foreach($tipeHeaders as $tipe)
                        <th>{{ strtoupper($tipe) }}</th>
                    @endforeach
                    <th>JUMLAH</th>
                </tr>
              </thead>
              <tbody>
                @foreach($jenisRows as $jenis => $sizes)
                    <tr>
                        <td>{{ $jenis }}</td>
                        @php $rowTotal = 0; @endphp
                        @foreach($tipeHeaders as $tipe)
                            @php
                                $size = $sizes->firstWhere('tipe', $tipe);
                                $jumlah = $size ? $size->jumlah : 0;
                                $rowTotal += $jumlah;
                            @endphp
                            <td>{{ $jumlah }}</td>
                        @endforeach
                        <td class="row-total">{{ $rowTotal }}</td>
                    </tr>
                @endforeach
              </tbody>
              <tfoot>
                <tr class="total-row">
                    <td>TOTAL</td>
                    @foreach($tipeHeaders as $tipe)
                        <td class="column-total">
                            {{ $mainTask->taskSizes->where('tipe', $tipe)->sum('jumlah') }}
                        </td>
                    @endforeach
                    <td class="grand-total">{{ $mainTask->total_jumlah }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="right-section">
          <h4>Gambar</h4>
          <div class="image-gallery" id="image-gallery">
            @forelse($mainTask->mockups as $mockup) <img src="{{ Storage::url($mockup->file_path) }}" alt="Mockup" class="gallery-image">
            @empty
                <p class="text-muted">Tidak ada mockup.</p>
            @endforelse
          </div>
          <!-- <div class="popup" id="image-popup">
            <span id="close-popup">&times;</span>
            <img id="popup-img" src="" alt="popup-image">
          </div> -->
        </div>
      </div>
    </div>

    {{-- ===== TAB 2: ACTIVITY / TIMELINE ===== --}}
    <div id="content-activity" class="tab-content">
      <h4>Checklist Activity</h4>

      <div class="activity-section" id="activity-container">
        @foreach($allTasksInGroup as $task)
            @php
                $line = $task->taskPekerjaans->first(); // Ambil line tunggal dari task ini
            @endphp
            @if($line)
                <div class="dropdown">
                  <button class="dropdown-btn">{{ $line->nama_pekerjaan }}<span class="dropdown-icon">▾</span></button>
                  <div class="dropdown-content">
                    @forelse($line->checklists as $checklist)
                        <label>
                            <input type="checkbox" class="activity-box progress-check" 
                                   data-id="{{ $checklist->id }}" 
                                   {{ $checklist->is_completed ? 'checked' : '' }}>
                            {{ $checklist->nama_checklist }}
                        </label>
                    @empty
                        <label class="text-muted small p-2">Belum ada checklist.</label>
                    @endforelse
                  </div>
                </div>
            @endif
        @endforeach
      </div>
      
      <div class="progress-bar-container">
        <div id="progress-bar-fill" style="width: {{ $progressPercentage }}%;"></div>
        <span id="progress-text">{{ $progressPercentage }}% complete</span>
      </div>

    

      <div class="comment-section">
        <h4>Comments</h4>
        <div class="chat-container" id="chat-container">
            @forelse($comments as $comment)
                <div class="comment-bubble {{ $comment->user_id == Auth::id() ? 'own' : '' }}">
                    <div class="comment-meta">
                        @if($comment->user_id != Auth::id())
                            <strong>{{ $comment->user->name }}</strong>
                        @endif
                    </div>
                    <div class="comment-body">
                        {{ $comment->body }}
                    </div>
                    <div class="comment-time">
                        {{ $comment->created_at->format('H:i') }}
                    </div>
                </div>
            @empty
                <p id="no-comments" class="text-center text-muted">Belum ada komentar.</p>
            @endforelse
        </div>
        
        <div class="comment-input-area">
            <textarea id="comment" placeholder="Tulis komentar di sini..."></textarea>
            <button id="submit-btn" data-task-id="{{ $mainTask->id }}">
                <i class="bi bi-send-fill"></i>
            </button>
        </div>
      </div>

    </div>
  </div>
</div>

<div class="popup" id="image-popup">
            <span id="close-popup">&times;</span>
            <img id="popup-img" src="" alt="popup-image">
          </div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/task-detail.css') }}">

@endpush

@push('scripts')
<script src="{{ asset('js/task-detail.js') }}"></script>
@endpush