@extends('layouts.nav-side')

@section('title', 'Trash') 

@section('content')

  <!-- Konten utama Trash Frame -->
  <div class="page">
    <div class="trash-page">
      <div class="trash-header">
        <h3>Trashed Tasks</h3>

        <div class="trash-header-actions">
          <button class="select-toggle">
            <i class="bi bi-check-square"></i> Pilih</button>
          <div class="trash-actions">
            <button class="restore-all">
              <i class="bi bi-arrow-clockwise"></i> Restored All
            </button>
            <button class="delete-all">
              <i class="bi bi-trash-fill"></i> Delete All
            </button>
          </div>
        </div>
      </div>

      <div class="trash-table-container">
        <table class="trash-table" id="trashTable">
          <thead>
            <tr>
              <th class="select-col"><input type="checkbox" id="selectAllTrash"></th>
              <th>No. PO</th>
              <th>Tasks Title</th>
              <th>Jumlah</th>
              <th>Line Pekerjaan</th>
              <th>Status</th>
              <th>Deleted At</th>
              <th>PIC</th>
              <th>Action</th>
            </tr>
          </thead>
          @php
              use Illuminate\Support\Str;
              use Carbon\Carbon;
          @endphp
         <tbody>
          @forelse($tasks as $task)
          
          @php
              $linePekerjaan = $task->taskPekerjaans->first();
          @endphp
          <tr>
            <td class="select-col">
                <input type="checkbox" class="row-select-trash" data-id="{{ $task->id }}">
            </td>
            <td>{{ $task->no_invoice }}</td>
            <td>
                <span class="dot yellow"></span> {{ $task->judul }}
            </td>
            <td>{{ $task->total_jumlah }}</td>
            
            <td>{{ $linePekerjaan ? $linePekerjaan->nama_pekerjaan : 'N/A' }}</td>
            
            <td>{{ $task->status->name }}</td>
            <td>{{ $task->deleted_at->format('j M Y') }}</td>
            <td>
                <div class="pic-circle">
                    {{ \App\Http\Controllers\TaskController::buatInisial($task->user->name) }}
                </div>
            </td>
            <td class="actions">
              <i class="bi bi-arrow-clockwise restore-icon" data-id="{{ $task->id }}"></i>
              <i class="bi bi-trash-fill delete-icon" data-id="{{ $task->id }}"></i>
            </td>
          </tr>
          @empty
          <tr>
            
            <td colspan="9" class="text-center">
              <i class="bi bi-trash display-6 d-block mb-2"></i>

              Tidak ada task di dalam sampah.

            </td>
          </tr>
          @endforelse
        </tbody>
        </table>
      </div>
    </div>
  </div>


@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/trash.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/trash.js') }}"></script>
@endpush