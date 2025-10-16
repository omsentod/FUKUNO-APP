@extends('layouts.nav-side')

@section('title', 'User') 

@section("content")



{{-- content --}}

<div class="page">
    <div class="title-page">
        <h2>User</h2>   
        <a class="add-new-btn" href="javascript:void(0);" onclick="showPopup()">
          <p> + </p>
          <p>Add New</p>
      </a>
    </div>

    <!-- Konten utama Team Frame -->
    <div class="team-container">
      <table class="team-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="member-info">
                <div class="circle red">CA</div>
                Codewave Asante
              </div>
            </td>
            <td><a href="mailto:Admin@gmail.com">Admin@gmail.com</a></td>
            <td>Admin</td>
            <td><span class="status active">Active</span></td>
            <td>
              <a href="#" class="edit">Edit</a>
              <a href="#" class="delete">Delete</a>
            </td>
          </tr>

          <tr>
            <td>
              <div class="member-info">
                <div class="circle orange">RW</div>
                Rifqi Widyadana
              </div>
            </td>
            <td><a href="mailto:rifqi@gmail.com">rifqi@gmail.com</a></td>
            <td>Manager</td>
            <td><span class="status active">Active</span></td>
            <td>
              <a href="#" class="edit">Edit</a>
              <a href="#" class="delete">Delete</a>
            </td>
          </tr>

          <tr>
            <td>
              <div class="member-info">
                <div class="circle yellow">RP</div>
                Raka Purbayu
              </div>
            </td>
            <td><a href="mailto:raka@gmail.com">raka@gmail.com</a></td>
            <td>Developer</td>
            <td><span class="status disabled">Disabled</span></td>
            <td>
              <a href="#" class="edit">Edit</a>
              <a href="#" class="delete">Delete</a>
            </td>
          </tr>

          <tr>
            <td>
              <div class="member-info">
                <div class="circle red">RA</div>
                Rafif Athalla
              </div>
            </td>
            <td><a href="mailto:rafif@gmail.com">rafif@gmail.com</a></td>
            <td>Designer</td>
            <td><span class="status active">Active</span></td>
            <td>
              <a href="#" class="edit">Edit</a>
              <a href="#" class="delete">Delete</a>
            </td>
          </tr>

          <tr>
            <td>
              <div class="member-info">
                <div class="circle blue">KA</div>
                Kartika Azizah
              </div>
            </td>
            <td><a href="mailto:kartika@gmail.com">kartika@gmail.com</a></td>
            <td>Designer</td>
            <td><span class="status active">Active</span></td>
            <td>
              <a href="#" class="edit">Edit</a>
              <a href="#" class="delete">Delete</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


</div>

<!-- Pop-up Modal -->
<div id="addUserPopup" class="popup-overlay hidden">
  <div class="popup-content">
    <h4>Add New Member</h4>
    <label>Full Name</label>
    <input type="text" id="newName" class="form-control mb-2" placeholder="Enter full name" required>

    <label>Email</label>
    <input type="email" id="newEmail" class="form-control mb-2" placeholder="Enter email" required>

    <label>Role</label>
    <input type="text" id="newRole" class="form-control mb-3" placeholder="Enter role" required>

    <div style="text-align:right;">
      <button id="cancelAdd" class="btn btn-secondary btn-sm">Cancel</button>
      <button id="saveAdd" class="btn btn-success btn-sm">Save</button>
    </div>
  </div>
</div>


@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/user.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/user.js') }}"></script>
@endpush