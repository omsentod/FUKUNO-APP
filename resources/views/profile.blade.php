@extends('layouts.nav-side')

@section('title', 'My Profile')

@section('content')
    <div class="page">
        <div class="profile-container">

            @if(session('success'))
                <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill"></i> {{ session('success') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li><i class="bi bi-exclamation-circle-fill"></i> {{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="profile-card">
                {{-- BAGIAN KIRI: AVATAR & INFO SINGKAT --}}
                <div class="profile-left">
                    <div class="avatar-lg" style="background-color: {{ $bgColor }};">
                        {{ $initials }}
                    </div>
                    <h3>{{ $user->name }}</h3>
                    <span class="role-badge">{{ ucfirst($user->role) }}</span>
                    <p class="email-text">{{ $user->email }}</p>
                </div>

                {{-- BAGIAN KANAN: TAB & FORM --}}
                <div class="profile-right">
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-target="tab-bio">Edit Profile</button>
                        <button class="tab-btn" data-target="tab-password">Change Password</button>
                    </div>

                    {{-- FORM EDIT BIO --}}
                    <div id="tab-bio" class="tab-content active">
                        <form action="{{ route('profile.update') }}" method="POST">
                            @csrf
                            @method('PUT')

                            <div class="form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" name="name" value="{{ old('name', $user->name) }}" required>
                            </div>

                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value="{{ old('email', $user->email) }}" required>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn-save">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>

                    {{-- FORM GANTI PASSWORD --}}
                    <div id="tab-password" class="tab-content">
                        <form action="{{ route('profile.password') }}" method="POST">
                            @csrf
                            @method('PUT')

                            <div class="form-group">
                                <label>Password Lama</label>
                                <input type="password" name="current_password" required>
                            </div>

                            <div class="form-group">
                                <label>Password Baru</label>
                                <input type="password" name="new_password" required placeholder="Min. 6 karakter">
                            </div>

                            <div class="form-group">
                                <label>Konfirmasi Password Baru</label>
                                <input type="password" name="new_password_confirmation" required>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn-save btn-danger-soft">Ganti Password</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/profile.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/profile.js') }}"></script>
    <script>
        // Auto-close alert after 3 seconds
        setTimeout(function () {
            let alerts = document.querySelectorAll('.alert');
            alerts.forEach(function (alert) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            });
        }, 3000);
    </script>
@endpush