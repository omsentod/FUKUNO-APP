@extends('layouts.nav-side')

@section('title', 'Checklist') 

@section('content')
  <!-- Konten Utama -->
  <div class="page">
    <div class="header-content">
      <h2>Checklist</h2>
      <button class="btn-add"><i class="bi bi-plus-lg"></i> Add new</button>
    </div>
    <div class="line-pekerjaan">
      <table class="table-line">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Checklist</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <tr>
            <td>1</td>
            <td>DTF</td>
            <td>
              <i class="bi bi-pencil-square action-icon edit"></i>
              <i class="bi bi-trash-fill action-icon delete"></i>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Sublim</td>
            <td>
              <i class="bi bi-pencil-square action-icon edit"></i>
              <i class="bi bi-trash-fill action-icon delete"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/clist.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/clist.js') }}"></script>
@endpush