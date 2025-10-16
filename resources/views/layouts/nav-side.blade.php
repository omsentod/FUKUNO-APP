<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', 'Default Title')</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
  <link rel="icon" href="{{ asset('assets/img/web-logo.ico') }}" type="image/x-icon">
  <link rel="stylesheet" href="{{ asset('css/dash.css') }}">
  @stack('styles')
  <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
  @php
  use Illuminate\Support\Facades\Auth;

  $user = Auth::user();
  $initials = '';

  if ($user && $user->name) {
      $words = explode(' ', $user->name);
      $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
  }

  // Warna dinamis berdasarkan huruf pertama nama (hitung sekali saja)
  $colors = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c'];
  $bgColor = $colors[ord(strtoupper(substr($initials ?? 'A', 0, 1))) % count($colors)];
@endphp

<!-- Navbar -->
<nav class="navbar">
  <div class="header-logo">
      <img src="assets/img/web-logo.png" alt="header logo">
  </div>

  <!-- Navbarkanan -->
  <div class="navbarkanan">
      <!-- Notifikasi -->
      <i class="bi bi-bell-fill icon-kanan" id="bell-icon"></i>
      <div class="notification" id="notification">  <!-- Hapus duplikasi, gunakan satu div -->
          <p>No notification yet!</p>  <!-- Atau gunakan konten dinamis, misalnya dari database -->
      </div>

      <!-- Profile Dropdown -->
      <div class="dropdown">
          <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle" id="profileDropdown"
             data-bs-toggle="dropdown" aria-expanded="false" style="gap: 8px;">
              <div class="profile-inisial" style="background-color: {{ $bgColor }};">
                  {{ $initials ?? '??' }}
              </div>
          </a>

          <ul class="dropdown-menu dropdown-menu-end mt-2 shadow" aria-labelledby="profileDropdown" style="min-width: 180px;">
              <li class="dropdown-item-text fw-bold text-center">{{ $user->name ?? 'Guest' }}</li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#">Profile</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="{{ route('login') }}">Logout</a></li>
          </ul>
      </div>
  </div>
</nav>

{{-- sidebar --}}
<div class="sidebar">
  <div class="sidebar-menu">
      <div class="sidebar-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('dashboard') }}">
              <i class="bi bi-bar-chart-line-fill" style="margin-right: 8px;"></i>
              Dashboard
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('task') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('task') }}">
              <i class="bi bi-list-task" style="margin-right: 8px;"></i>
              Task
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('workline') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('workline') }}">
              <i class="bi bi-wrench-adjustable" style="margin-right: 8px;"></i>
              Line Pekerjaan
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('status') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('status') }}">
              <i class="bi bi-arrow-repeat" style="margin-right: 8px;"></i>
              Status
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('checklist') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('checklist') }}">
              <i class="bi bi-card-checklist" style="margin-right: 8px;"></i>
              Checklist
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('user') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('user') }}">
              <i class="bi bi-people-fill" style="margin-right: 8px;"></i>
              User
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('archive') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('archive') }}">
              <i class="bi bi-archive-fill" style="margin-right: 8px;"></i>
              Archive
          </a>
      </div>
      <div class="sidebar-item {{ request()->routeIs('trash') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('trash') }}">
              <i class="bi bi-trash-fill" style="margin-right: 8px;"></i>
              Trash
          </a>
      </div>
      <div class="setting">
          <a href=""><i class="bi bi-gear-wide-connected" style="margin-right: 8px;"></i>Setting</a>
      </div>
  </div>
</div>

 <!-- The Content -->
 <main>
    @yield('content') <!-- Konten dinamis -->
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script src="{{ asset('js/dash.js') }}"></script>
@stack('scripts')
</body>
</html>
