@extends('layouts.nav-side')

@section('title', 'Line Pekerjaan')

@section('content')
<div class="page">
  <div class="header-content">
    <h2>Line Pekerjaan</h2>
    <button type="button" class="btn-add"><i class="bi bi-plus-lg"></i> Add new</button>
  </div>

  <div class="line-pekerjaan">
    <table class="table-line">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nama Line Pekerjaan</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="tableBody">
        @foreach($pekerjaans as $pekerjaan)
        <tr>
          <td>{{ $pekerjaan->id }}</td>
          <td>{{ $pekerjaan->job_name }}</td>
          <td>
            <button type="button" class="btn-icon edit-btn" data-id="{{ $pekerjaan->id }}" data-name="{{ $pekerjaan->job_name }}">
              <i class="bi bi-pencil-square action-icon edit"></i>
            </button>
            
            <form action="{{ route('pekerjaan.destroy', $pekerjaan->id) }}" method="POST" style="display:inline;">
              @csrf
              @method('DELETE')
              <button type="submit" class="btn-delete">
                <i class="bi bi-trash-fill action-icon delete"></i>
              </button>
            </form>
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
</div>

{{-- Popup form Add new/Edit--}}
<div class="popup" id="popupForm" style="display:none;">
  <div class="popup-content">
    <h3 id="popupTitle">Tambah Pekerjaan Baru</h3>
    <form id="pekerjaanForm" method="POST">
      @csrf
      <input type="hidden" name="_method" id="formMethod" value="POST">
      <input type="hidden" name="id" id="pekerjaanId">
      
      <div class="mb-3">
        <label for="job_name" class="form-label">Nama Pekerjaan</label>
        <input type="text" name="job_name" id="job_name" class="form-control" required>
      </div>

      <button type="submit" class="btn btn-save">Simpan</button>
      <button type="button" id="closePopup" class="btn btn-secondary">Batal</button>
    </form>
  </div>
</div>
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/workline.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/workline.js') }}"></script>
@endpush