@extends('layouts.nav-side')

@section('title', 'Line Pekerjaan')

@section('content')
<div class="page">
  <div class="header-content">
    <h2>Line Pekerjaan</h2>
    <button type="button" class="btn-add">
      <i class="bi bi-plus-lg"></i> Add new
    </button>
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
          <td>{{ $pekerjaan->nama_pekerjaan }}</td>
          <td>
            {{-- Tombol edit tidak membuka halaman baru, tapi ditangani oleh JS --}}
            <button type="button" class="btn-icon edit" title="Edit">
              <i class="bi bi-pencil-square"></i>
            </button>

            {{-- Tombol delete tetap langsung kirim form --}}
            <form action="{{ route('pekerjaan.destroy', $pekerjaan->id) }}" method="POST" style="display:inline;">
              @csrf
              @method('DELETE')
              <button type="submit" class="btn-icon delete" title="Hapus">
                <i class="bi bi-trash-fill"></i>
              </button>
            </form>
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
</div>

{{-- Popup akan ditampilkan dari JS, jadi tidak perlu ditulis di sini --}}
@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/workline.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/workline.js') }}"></script>
@endpush