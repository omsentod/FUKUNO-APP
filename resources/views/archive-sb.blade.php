@extends('layouts.nav-side')

@section('title', 'Archive') 


@section('content')
<!--KONTEN UTAMA -->
<div class="page">
    <div class="archive-container">
      <div class="archive-header">
        <h3>Archive</h3>

        <div class="archive-header-actions">
          <button class="select-toggle">Pilih</button>
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
        <table class="archive-table">
          <thead>
            <tr>
              <th class="select-col"><input type="checkbox" id="selectAll" style="display:none;"></th>
              <th>No. PO</th>
              <th>Tasks Title</th>
              <th>Jumlah</th>
              <th>Line Pekerjaan</th>
              <th>Status</th>
              <th>Finished Date</th>
              <th>PIC</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="select-col"><input type="checkbox" class="row-select" style="display:none;"></td>
              <td>FKN/1024/051</td>
              <td>DTF Ulang Tahun</td>
              <td>12</td>
              <td>DTF</td>
              <td><span class="status cancel">Cancel</span></td>
              <td>10 Sep 2025</td>
              <td><div class="pic-circle">AK</div></td>
              <td class="action-icons">
                <i class="bi bi-arrow-counterclockwise" title="Restore"></i>
                <i class="bi bi-file-earmark-text" title="Detail"></i>
                <i class="bi bi-trash-fill" title="Delete"></i>
              </td>
            </tr>
            <tr>
              <td class="select-col"><input type="checkbox" class="row-select" style="display:none;"></td>
              <td>FKN/1024/051</td>
              <td>DTF Ulang Tahun</td>
              <td>12</td>
              <td>Konveksi</td>
              <td><span class="status selesai">Selesai</span></td>
              <td>10 Sep 2025</td>
              <td><div class="pic-circle">AK</div></td>
              <td class="action-icons">
                <i class="bi bi-arrow-counterclockwise" title="Restore"></i>
                <i class="bi bi-file-earmark-text" title="Detail"></i>
                <i class="bi bi-trash-fill" title="Delete"></i>
              </td>
            </tr>
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