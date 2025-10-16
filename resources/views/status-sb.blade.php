@extends('layouts.nav-side')

@section('title', 'Status') 

@section('content')

<!-- Konten utama -->
<div class="page">
    <div class="header-content">
        <h2>Status</h2>
        <button class="btn-add" id="addBtn"><i class="bi bi-plus-lg"></i> Add new</button>
      </div>
    <div class="status-container">
        <table class="table-status">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="statusTable">
          <tr>
            <td>1</td>
            <td>WIP</td>
            <td class="action-icons">
              <i class="bi bi-pencil-square text-warning edit-btn"></i>
              <i class="bi bi-download text-success download-btn"></i>
              <i class="bi bi-trash-fill text-danger delete-btn"></i>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>DONE AND READY</td>
            <td class="action-icons">
              <i class="bi bi-pencil-square text-warning edit-btn"></i>
              <i class="bi bi-download text-success download-btn"></i>
              <i class="bi bi-trash-fill text-danger delete-btn"></i>
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td>BUTUH DIKERJAKAN</td>
            <td class="action-icons">
              <i class="bi bi-pencil-square text-warning edit-btn"></i>
              <i class="bi bi-download text-success download-btn"></i>
              <i class="bi bi-trash-fill text-danger delete-btn"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Popup Add -->
  <div class="popup" id="addPopup">
    <div class="popup-content">
      <h4>Tambah Status Baru</h4>
      <input type="text" id="newStatusInput" placeholder="Masukkan nama status">
      <button id="saveStatus">Simpan</button>
      <button class="close-popup">Batal</button>
    </div>
  </div>

  <!-- Popup Edit -->
  <div class="popup" id="editPopup">
    <div class="popup-content">
      <h4>Edit Nama Status</h4>
      <input type="text" id="editStatusInput">
      <button id="updateStatus">Perbarui</button>
      <button class="close-popup">Batal</button>
    </div>
  </div>

  <!-- Popup Delete -->
  <div class="popup" id="deletePopup">
    <div class="popup-content">
      <h4>Apakah yakin ingin menghapus?</h4>
      <button id="confirmDelete">Ya</button>
      <button class="close-popup">Batal</button>
    </div>
  </div>

  <div id="notif" class="notif">Status berhasil ditambahkan!</div>

  @endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/status.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/status.js') }}"></script>
@endpush