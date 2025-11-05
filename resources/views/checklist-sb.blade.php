@extends('layouts.nav-side')

@section('title', 'Checklist') 

@section('content')

<!-- Konten utama -->
<meta name="csrf-token" content="{{ csrf_token() }}">

<div class="page">
  
    <div class="checklist-container">
      <div class="header-content">
        <h2>Checklist</h2>
        <button class="btn-add" id="addBtn"><i class="bi bi-plus-lg"></i> Add new</button>
      </div>
        <table class="table-checklist">
        <thead>
          <tr>
            <th>ID</th>
            <th>Checklist</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="checklistsTable">
        </tbody>
      </table>
    </div>
  </div>

  <!-- Popup Add -->
  <div class="popup" id="addPopup">
    <div class="popup-content">
      <h4>Tambah Checklist Baru</h4>
      <input type="text" id="newChecklistInput" placeholder="Masukkan nama Checklist">
      <div class="popup-footer">
        <button class="close-popup">Batal</button>
        <button id="saveChecklist">Simpan</button>
      </div>
    </div>
  </div>

  <!-- Popup Edit -->
  <div class="popup" id="editPopup">
    <div class="popup-content">
      <h4>Edit Nama Checklist</h4>
      <input type="text" id="editChecklistInput">
      <button id="updateChecklist">Perbarui</button>
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

  <div id="notif" class="notif">Checklilst berhasil ditambahkan!</div>

  @endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/clist.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/clist.js') }}"></script>
@endpush