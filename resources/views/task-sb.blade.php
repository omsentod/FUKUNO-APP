@extends('layouts.nav-side')

@section('title', 'Task') 

@section('content')

   <div class="page">
    <div class="title-page">
        <h2>Task</h2>   
        <button class="btn-add" id="addBtn"><i class="bi bi-plus-lg"></i> Add new</button>
    </div>
    <div class="task">
    <table>
        <thead>
            <tr>
                <th>No. PO</th>
                <th>Tasks Title</th>
                <th>Jumlah</th>
                <th>Line Pekerjaan</th>
                <th>Urgent</th>
                <th>Status</th>
                <th>Time Left</th>
                <th>Mockup</th>
                <th>PIC</th>
                <th>Progress</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody class="table-bg">
            <tr>
                <td>FKN/024/051</td>
                <td>DTF Ulang tahun</td>
                <td>12</td>
                <td><button class="line-btn">DTF</button></td>
                <td>Urgent</td>
                <td>
                    <div class="dropdown">
                        <button class="status-btn status-needs-work dropdown-toggle" type="button" id="statusDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="status-text">Needs Work</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="statusDropdown1">
                            <a class="dropdown-item" href="#" data-status="Done and Ready">Done and Ready</a>
                            <a class="dropdown-item" href="#" data-status="In Progress">In Progress</a>
                            <a class="dropdown-item" href="#" data-status="Hold">Hold</a>
                            <a class="dropdown-item" href="#" data-status="Needs Work">Needs Work</a>
                        </div>
                    </div>
                </td>
                <td>5 hari lagi</td>
                <td><img src="assets/img/saim_jrsy.png"class="mockup"></td>
                <td><div class="pic">AKT</div></td>
                <td>
                    <div class="dropdown">
                        <button class="progress dropdown-toggle" type="button" id="progressDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="progress-text">0%</span>
                        </button>
                        <div class="dropdown-menu p-3" aria-labelledby="progressDropdown1" style="width: 200px;">
                            <form class="progress-form">
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check1">
                                    <label class="form-check-label" for="check1">Design</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check2">
                                    <label class="form-check-label" for="check2">Production</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check3">
                                    <label class="form-check-label" for="check3">Quality Check</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check5">
                                    <label class="form-check-label" for="check5">Packaging</label>
                                </div>
                                <button type="button" class="btn btn-primary mt-3 done-btn" data-bs-toggle="dropdown">Done</button>
                            </form>
                        </div>
                    </div>
                </td>
                <td class="icon-cell">
                    <i class="bi bi-pencil-square icon-edit"></i>
                    <i class="bi bi-cloud-download-fill icon-download"></i>
                    <i class="bi bi-trash3-fill icon-trash"></i>
                </td>                
            </tr>
            <tr>
                <td>FKN/024/051</td>
                <td>DTF Ulang tahun</td>
                <td>12</td>
                <td><button class="line-btn">DTF</button></td>
                <td>Urgent</td>
                <td>
                    <div class="dropdown">
                        <button class="status-btn status-needs-work dropdown-toggle" type="button" id="statusDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="status-text">Needs Work</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="statusDropdown1">
                            <a class="dropdown-item" href="#" data-status="Done and Ready">Done and Ready</a>
                            <a class="dropdown-item" href="#" data-status="In Progress">In Progress</a>
                            <a class="dropdown-item" href="#" data-status="Hold">Hold</a>
                            <a class="dropdown-item" href="#" data-status="Needs Work">Needs Work</a>
                        </div>
                    </div>
                </td>
                <td>5 hari lagi</td>
                <td><img src="assets/img/saim_jrsy.png"class="mockup"></td>
                <td><div class="pic">AKT</div></td>

                <td>
                    <div class="dropdown">
                        <button class="progress dropdown-toggle" type="button" id="progressDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="progress-text">0%</span>
                        </button>
                        <div class="dropdown-menu p-3" aria-labelledby="progressDropdown1" style="width: 200px;">
                            <form class="progress-form">
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check1">
                                    <label class="form-check-label" for="check1">Design</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check2">
                                    <label class="form-check-label" for="check2">Production</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check3">
                                    <label class="form-check-label" for="check3">Quality Check</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check5">
                                    <label class="form-check-label" for="check5">Packaging</label>
                                </div>
                                <button type="button" class="btn btn-primary mt-3 done-btn" data-bs-toggle="dropdown">Done</button>
                            </form>
                        </div>
                    </div>
                </td>
                <td class="icon-cell">
                    <i class="bi bi-pencil-square icon-edit"></i>
                    <i class="bi bi-cloud-download-fill icon-download"></i>
                    <i class="bi bi-trash3-fill icon-trash"></i>
                </td>                
            </tr>
            <tr>
                <td>FKN/024/051</td>
                <td>DTF Ulang tahun</td>
                <td>12</td>
                <td><button class="line-btn">DTF</button></td>
                <td>Urgent</td>
                <td>
                    <div class="dropdown">
                        <button class="status-btn status-needs-work dropdown-toggle" type="button" id="statusDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="status-text">Needs Work</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="statusDropdown1">
                            <a class="dropdown-item" href="#" data-status="Done and Ready">Done and Ready</a>
                            <a class="dropdown-item" href="#" data-status="In Progress">In Progress</a>
                            <a class="dropdown-item" href="#" data-status="Hold">Hold</a>
                            <a class="dropdown-item" href="#" data-status="Needs Work">Needs Work</a>
                        </div>
                    </div>
                </td>
                <td>5 hari lagi</td>
                <td><img src="assets/img/saim_jrsy.png"class="mockup"></td>
                <td><div class="pic">AKT</div></td>
                <td>
                    <div class="dropdown">
                        <button class="progress dropdown-toggle" type="button" id="progressDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="progress-text">0%</span>
                        </button>
                        <div class="dropdown-menu p-3" aria-labelledby="progressDropdown1" style="width: 200px;">
                            <form class="progress-form">
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check1">
                                    <label class="form-check-label" for="check1">Design</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check2">
                                    <label class="form-check-label" for="check2">Production</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check3">
                                    <label class="form-check-label" for="check3">Quality Check</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input progress-check" type="checkbox" id="check5">
                                    <label class="form-check-label" for="check5">Packaging</label>
                                </div>
                                <button type="button" class="btn btn-primary mt-3 done-btn" data-bs-toggle="dropdown">Done</button>
                            </form>
                        </div>
                    </div>
                </td>
                <td class="icon-cell">
                    <i class="bi bi-pencil-square icon-edit"></i>
                    <i class="bi bi-cloud-download-fill icon-download"></i>
                    <i class="bi bi-trash3-fill icon-trash"></i>
                </td>                
            </tr>
        </tbody>
    </table>
</div>
   </div>

  
    <!-- Popup Form -->
    <div class="popup-overlay" style="display: none;">
        <div class="popup" style="max-width: 850px; width: 95%; max-height: 90vh; overflow-y: auto;">
            <h5 class="mb-3">Tambah Task Baru</h5>
            <form id="taskForm">
                <div class="mb-2">
                    <label>No Invoice</label>
                    <input type="text" id="noInvoice" class="form-control" placeholder="No. Invoice" required>
                </div>

                <div class="mb-2">
                    <label>Nama Pelanggan</label>
                    <input type="text" id="namaPelanggan" class="form-control" placeholder="Nama Pelanggan" required>
                </div>

                <div class="mb-2">
                    <label>Judul</label>
                    <input type="text" id="judul" class="form-control" placeholder="Judul" required>
                </div>

                <div class="mb-2">
                    <label>Catatan</label>
                    <textarea id="catatan" class="form-control" placeholder="Catatan" rows="3"></textarea>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label>Penanggung Jawab</label>
                        <select id="penanggungJawab" class="form-select">
                            <option value="">-- Pilih Penanggung Jawab --</option>
                            <option value="Raka">Raka</option>
                            <option value="Tito">Tito</option>
                            <option value="Arya">Arya</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label>Urgensi</label>
                        <select id="urgensi" class="form-select">
                            <option value="">Pilih</option>
                            <option value="Tinggi">Tinggi</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Rendah">Rendah</option>
                        </select>
                    </div>
                </div>

                <hr>

                <h6>Line Pekerjaan & Checklist</h6>
                <a href="#" id="addLine" class="text-primary small mb-2 d-inline-block">+ Tambah Line Pekerjaan</a>
                <div id="lineContainer"></div>

                <hr>

                <h6>Jenis & Size</h6>
                <table class="table table-bordered text-center align-middle" id="sizeTable">
                    <thead class="table-danger">
                        <tr>
                            <th>Jenis Size</th>
                            <th>Size</th>
                            <th>Jumlah</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="text" class="form-control" placeholder="Jenis" value="Baju Anak"></td>
                            <td><input type="text" class="form-control" placeholder="Size" value="L"></td>
                            <td><input type="text" class="form-control" placeholder="Jumlah" value="10 Pcs"></td>
                            <td><button type="button" class="btn btn-danger btn-sm btn-remove">Hapus</button></td>
                        </tr>
                    </tbody>
                </table>
                <a href="#" id="addRow" class="text-primary small mb-2 d-inline-block">+ Tambah Kolom</a>

                <div class="mb-2">
                    <label>Jumlah</label>
                    <input type="text" id="jumlah" class="form-control">
                </div>

                <div class="row mb-2">
                    <div class="col-md-6">
                        <label>Warna</label>
                        <input type="text" id="warna" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label>Model</label>
                        <input type="text" id="model" class="form-control">
                    </div>
                </div>

                <div class="mb-2">
                    <label>Bahan</label>
                    <input type="text" id="bahan" class="form-control">
                </div>

                <div class="mb-3">
                    <label>Mockup</label>
                    <input type="file" id="mockup" class="form-control">
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
            </form>

        </div>
    </div>
    {{-- end pop up --}}
    
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/task.css') }}">
@endpush



@push('scripts')
    <script src="{{ asset('js/task.js') }}"></script>
@endpush