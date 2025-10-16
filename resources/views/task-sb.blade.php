@extends('layouts.nav-side')

@section('title', 'Task') 

@section('content')

   <div class="page">
    <div class="title-page">
        <h2>Task</h2>   
        <a class="add-new-btn" href="">
           <p> + </p>
           <p>Add New</p>
        </a>
    </div>
 

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
        <tbody>
            <tr>
                <td>FKN/024/051</td>
                <td>Kaos SD SAIM</td>
                <td>12</td>
                <td><button class="line-btn">DTF</button></td>
                <td>Urgent</td>
                <td>
                    <div class="dropdown">
                        <button class="status-btn status-done dropdown-toggle" type="button" id="statusDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
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
                <td><span class="mockup-dot"></span></td>
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
                <td>JERSEY ANGKATAN UNAIR</td>
                <td>12</td>
                <td><button class="line-btn">DTF</button></td>
                <td>Normal</td>
                <td>
                    <div class="dropdown">
                        <button class="status-btn status-done dropdown-toggle" type="button" id="statusDropdown1" data-bs-toggle="dropdown" aria-expanded="false">
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
                <td><span class="mockup-dot"></span></td>
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
                <td><span class="mockup-dot"></span></td>
                <td><img src="path/to/your/image.jpg" alt="Deskripsi gambar" class="mockup"></td>
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
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/task.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/task.js') }}"></script>
@endpush