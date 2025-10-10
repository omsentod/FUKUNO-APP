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
                <td><button class="status-btn status-done">Done and Ready</button></td>
                <td>5 hari lagi</td>
                <td><span class="mockup-dot"></span></td>
                <td><div class="pic">AKT</div></td>
                <td><div class="progress">70%</div></td>
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
                <td><button class="status-btn">BUTUH DIKERJAKAN</button></td>
                <td>5 hari lagi</td>
                <td><span class="mockup-dot"></span></td>
                <td><div class="pic">AKT</div></td>
                <td><div class="progress">70%</div></td>
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
                <td><button class="status-btn status-done">Done and Ready</button></td>
                <td>5 hari lagi</td>
                <td><span class="mockup-dot"></span></td>
                <td><div class="pic">AKT</div></td>
                <td><div class="progress">70%</div></td>
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