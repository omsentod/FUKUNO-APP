@extends('layouts.nav-side')

@section('title', 'User') 

@section("content")



{{-- content --}}

<div class="page">
    <div class="title-page">
        <h2>Task</h2>   
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
<div id="popupModal" class="add-team-container hidden">
    <div class="heading-form">
        Add Team Member
        <span class="close-btn" onclick="closePopup()"> × </span>
    </div>
    <form id="addTeamForm" class="add-team-form" onsubmit="submitForm(event)">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" name="name" placeholder="Enter full name" required>
      </div>
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" placeholder="Enter title (e.g., Designer)" required>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Enter email address" required>
      </div>
      <div class="form-group">
        <label for="role">Role</label>
        <input type="text" id="role" name="role" placeholder="Enter role (e.g., Frontend Developer)" required>
      </div>

      <button type="submit" class="btn-submit">Add Member</button>
    </form>

    <!-- Notifikasi -->
    <div id="notif" class="notif hidden">✅ Data berhasil ditambahkan!</div>
</div>
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/user.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/user.js') }}"></script>
@endpush