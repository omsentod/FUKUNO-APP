@extends('layouts.nav-side')

@section('title', 'User')

@section("content")



<div class="page">


    <div class="team-container">
        <div class="title-page user-header">
            <div class="left-section">
                <h2>User</h2>
                
                {{-- SEARCH BOX --}}
                <div class="search-container">
                    <div class="input-with-icon">
                        <i class="bi bi-search search-icon"></i>
                        <input type="text" id="userSearchInput" class="form-control" placeholder="Cari User...">
                    </div>
                </div>
            </div>
            
            <button class="btn-add" id="addBtn" onclick="showPopup('create')">      
                <i class="bi bi-plus-lg"></i> Add New
            </button>
        </div>

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
                    @php
                        // Logika Warna Avatar
                        $fullName = $user->name ?? '';
                        $words = explode(' ', trim($fullName));
                        $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
                        
                        $picName = $initials ?: 'A'; 
                        $hue = ((ord(strtoupper(substr($picName, 0, 1))) - ord('A')) * 14) % 360;
                        $bgColor = "hsl({$hue}, 65%, 40%)";
                    @endphp

                    <tr data-id="{{ $user->id }}" 
                        data-name="{{ $user->name }}" 
                        data-email="{{ $user->email }}" 
                        data-role="{{ $user->role }}">
                        
                        <td>
                            <div class="member-info">
                                <div class="circle" style="background-color: {{ $bgColor }};">
                                    {{ $initials }}
                                </div>
                                {{ $user->name }}
                            </div>
                        </td>

                        <td><a href="mailto:{{ $user->email }}">{{ $user->email }}</a></td>
                        <td>{{ ucfirst($user->role) }}</td>
                        
                        <td>
                            <a href="#" class="edit" onclick="event.preventDefault(); editUser(this)">Edit</a>
                            
                            <a href="#" class="delete" onclick="event.preventDefault(); deleteUser({{ $user->id }})">Delete</a>
                            
                            </td> 
                    </tr>
                @endforeach
            </tbody>
            </table>
    </div>
</div>

<!-- Popup Modal aaaaaaaaaaaaaaaaaaaaaaaaa-->
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
