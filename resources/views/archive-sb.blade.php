@extends('layouts.nav-side')

@section('title', 'Archive') 


@section('content')
<!--KONTEN UTAMA -->
<div class="page">
    <div class="archive-container">
      <div class="archive-header">
        <h3>Archive</h3>

        <div class="archive-header-actions">
          <button class="select-toggle">
            <i class="bi bi-check-square"></i> Pilih</button>
          <div class="archive-actions">
            <button class="restore-all">
              <i class="bi bi-arrow-clockwise"></i> Restored All
            </button>
            <button class="delete-all">
              <i class="bi bi-archive-fill"></i> Delete All
            </button>
          </div>
        </div>
        
      </div>
  
      <div class="archive-table-container">
        <table class="archive-table" id="archiveTable">
          <thead>
            <tr>
              <th class="select-col"><input type="checkbox" id="selectAll"></th>
              <th>No. PO</th>
              <th>Tasks Title</th>
              <th>Jumlah</th>
              <th>Line Pekerjaan</th>
              <th>Status</th>
              <th>Finished Date</th>
              <th>Klien</th>
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
        <tr class="clickable-row" 
        data-url="{{ route('task.show', $task->id) }}" 
        style="cursor: pointer;">
          <td class="select-col"><input type="checkbox" class="row-select" data-id="{{ $task->id }}"></td>
          <td>{{ $task->no_invoice }}</td>
          <td>{{ $task->judul }}</td>
          <td>{{ $task->total_jumlah }}</td>
          <td>{{ $linePekerjaan ? $linePekerjaan->nama_pekerjaan : 'N/A' }}</td>
          <td><span class="status status-{{ Str::slug($task->status->name) }}">{{ $task->status->name }}</span></td>
          <td>{{ $task->updated_at->format('j M Y') }}</td>
          <td>{{ $task->nama_pelanggan }}</td>
          <td> 
            <div class="action-icons"> <i class="bi bi-arrow-counterclockwise" title="Restore" data-id="{{ $task->id }}"></i>
            <i class="bi bi-file-earmark-text" title="Detail" data-id="{{ $task->id }}"></i>
            <i class="bi bi-trash-fill" title="Delete" data-id="{{ $task->id }}"></i>
          </div>
          </td>
        </tr>
        @empty
        <tr>
          <td colspan="9" class="text-center">
            <i class="bi bi-archive-fill display-6 d-block mb-2"></i>
            Belum ada task yang diarsipkan.
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
    <link rel="stylesheet" href="{{ asset('css/archive.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/archive.js') }}"></script>
@endpush