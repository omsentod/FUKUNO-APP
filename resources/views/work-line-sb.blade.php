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
          <th>Deadline</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="tableBody">
        @foreach($pekerjaans as $pekerjaan)
        <tr>
          <td>{{ $pekerjaan->id }}</td>
          <td>{{ $pekerjaan->nama_pekerjaan }}</td>
          <td>{{ $pekerjaan->deadline ?? '-' }}</td>
          <td>
            <a action="{{ route('pekerjaan.edit', $pekerjaan->id) }}"><i class="bi bi-pencil-square action-icon edit"></i></a>
            <form action="{{ route('pekerjaan.destroy', $pekerjaan->id) }}" method="POST" style="display:inline;">
              @csrf
              @method('DELETE')
              <button type="submit" class="btn-delete"><i class="bi bi-trash-fill action-icon delete"></i></button>
            </form>
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
</div>

{{-- Popup form --}}
<div class="popup" id="popupForm" style="display:none;">
  <div class="popup-content">
    <h3>Tambah Pekerjaan Baru</h3>
    <form action="{{ route('pekerjaan.store') }}" method="POST">
      @csrf
      <div class="mb-3">
        <label for="nama_pekerjaan" class="form-label">Nama Pekerjaan</label>
        <input type="text" name="nama_pekerjaan" id="nama_pekerjaan" class="form-control" required>
      </div>

      <div class="mb-3">
        <label for="deadline" class="form-label">Deadline</label>
        <input type="date" name="deadline" id="deadline" class="form-control">
      </div>

      <button type="submit" class="btn btn-primary">Simpan</button>
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
