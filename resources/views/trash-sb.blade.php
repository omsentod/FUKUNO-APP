@extends('layouts.nav-side')

@section('title', 'Trash') 

@section('content')

  <!-- Konten utama Trash Frame -->
  <div class="page">
    <div class="trash-page">
      <div class="trash-header">
        <h3>Trashed Tasks</h3>

        <div class="trash-header-actions">
          <button class="select-toggle">Pilih</button>
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
        <table class="trash-table">
          <thead>
            <tr>
              <th>Tasks Title</th>
              <th>Priority</th>
              <th>Stage</th>
              <th>Modified On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="dot yellow"></span> Duplicate - Duplicate - Review</td>
              <td>Urgent</td>
              <td>In Progress</td>
              <td>Fri Feb 09 2024</td>
              <td class="actions">
                <i class="bi bi-arrow-clockwise restore-icon"></i>
                <i class="bi bi-trash-fill delete-icon"></i>
              </td>
            </tr>
            <tr>
              <td><span class="dot pink"></span> Test Task</td>
              <td>Urgent</td>
              <td>To Do</td>
              <td>Fri Feb 09 2024</td>
              <td class="actions">
                <i class="bi bi-arrow-clockwise restore-icon"></i>
                <i class="bi bi-trash-fill delete-icon"></i>
              </td>
            </tr>
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