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
      <h4>Tambah Group Checklist</h4>
      <div class="mb-3">
          <label>Nama Checklist</label>
          <input type="text" id="newChecklistInput" class="form-control">
      </div>
      
      <div class="mb-3">
          <label>List Item </label>
          <div id="checklistItemsContainer">
              <div class="d-flex gap-2 mb-2">
                  <input type="text" class="form-control item-input" placeholder="Item 1">
              </div>
          </div>
          <button class="btn btn-sm btn-outline-primary" id="addItemInputBtn">+ Tambah Item</button>
      </div>

      <div class="popup-footer">
        <button class="close-popup btn btn-secondary">Batal</button>
        <button id="saveChecklist" class="btn btn-primary">Simpan</button>
      </div>
    </div>
  </div>

  <!-- Popup Edit -->
  <div class="popup" id="editPopup">
    <div class="popup-content">
      <h4>Edit Group Checklist</h4>
      
      <div class="mb-3">
          <label>Judul Group</label>
          <input type="text" id="editChecklistInput" class="form-control">
      </div>

      <div class="mb-3">
          <label>List Item</label>
          <div id="editItemsContainer" style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">
              </div>
          <button type="button" class="btn btn-sm btn-outline-primary" id="addEditItemBtn">+ Tambah Item</button>
      </div>

      <div class="popup-footer">
        <button class="close-popup btn btn-secondary">Batal</button>
        <button id="updateChecklist" class="btn btn-primary">Perbarui</button>
      </div>
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