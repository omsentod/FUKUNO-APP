@extends('layouts.nav-side')

@section('title', 'User')

@section("content")

<div class="page">
    <div class="title-page">
        <h2>User</h2>
        <a class="add-new-btn" href="javascript:void(0);" onclick="showPopup('create')">
            <p> + </p>
            <p>Add New</p>
        </a>
    </div>

    <div class="team-container">
        <table class="team-table">
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    {{-- <th>Password</th>
                    <th>Active</th> --}}
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="userTableBody">
                @foreach($users as $user)
                <tr data-id="{{ $user->id }}" data-name="{{ $user->name }}" data-email="{{ $user->email }}" data-role="{{ $user->role }}">
                    <td>
                        <div class="member-info">
                            <div class="circle red">{{ strtoupper(substr($user->name, 0, 2)) }}</div>
                            {{ $user->name }}
                        </div>
                    </td>

                    <td><a href="mailto:{{ $user->email }}">{{ $user->email }}</a></td>
                    <td>{{ ucfirst($user->role) }}</td>
                    <td>
                        <a href="#" class="edit">Edit</a>
                        <a href="#" class="delete" data-id="{{ $user->id }}">Delete</a>
                    </td> 
                    {{-- <td>
                        <div class="password-cell">
                            <input type="password" class="password-field" value="{{ $user->password }}" readonly>
                            <i class="bi bi-eye-slash toggle-password"></i>
                        </div>
                    </td> --}}
                    {{-- <td><span class="status active">Active</span></td> --}}

                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

<!-- Popup Modal -->
<div id="addUserPopup" class="popup-overlay hidden">
    <div class="popup-content">
        <h4 id="popupTitle">Add New User</h4>
        <form id="addUserForm">
            @csrf
            <input type="hidden" name="id" id="userId">

            <label>Full Name</label>
            <input type="text" name="name" id="name" class="form-control mb-2" placeholder="Enter full name" required>

            <label>Email</label>
            <input type="email" name="email" id="email" class="form-control mb-2" placeholder="Enter email" required>

            <label>Role</label>
            <select name="role" id="role" class="form-control mb-3" required>
                <option value="">-- Select Role --</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

            <label>Password</label>
            <div class="password-cell mb-3">
                <input type="password" name="password" id="password" class="form-control password-field" placeholder="Enter password">
                <i class="bi bi-eye-slash toggle-password"></i>
            </div>

            <label>Confirm Password</label>
            <div class="password-cell mb-3">
                <input type="password" name="password_confirmation" id="password_confirmation" class="form-control password-field" placeholder="Confirm password">
                <i class="bi bi-eye-slash toggle-password"></i>
            </div>

            <div style="text-align:right;">
                <button type="button" id="cancelAdd" class="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" class="btn btn-success btn-sm" id="saveAdd">Save</button>
            </div>
        </form>
    </div>
</div>

@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/user.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/user.js') }}"></script>
@endpush
