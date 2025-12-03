<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}"> 
  <meta name="user-id" content="{{ Auth::id() }}">
  <title>@yield('title', 'Default Title')</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
  <link rel="icon" href="{{ asset('assets/img/web-logo.ico') }}" type="image/x-icon">
  <link rel="stylesheet" href="{{ asset('css/dash.css') }}">

  @stack('styles')
  @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="page-preloader">
        <div class="spinner"></div>
    </div>
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
        <i class="bi bi-list icon-kanan" id="navbar-hamburger-btn"></i>
        <a href="{{ route('dashboard') }}">
            <img src="{{ asset('assets/img/web-logo.png') }}" alt="header logo">
        </a>
       
    </div>

  <!-- Navbarkanan -->
  <div class="navbarkanan">
    
      <!-- Notifikasi -->
  <div class="notification-wrapper" style="position: relative; display: inline-block;">
          
          <i class="bi bi-bell-fill icon-kanan {{ $unreadNotificationsCount > 0 ? 'is-ringing' : '' }}" 
             id="bell-icon"></i>
          
          <span class="notification-badge" 
                id="notification-badge" 
                style="{{ $unreadNotificationsCount > 0 ? 'display: flex;' : 'display: none;' }}">
              {{ $unreadNotificationsCount }}
          </span>

      </div>
     
      <div class="notification" id="notification">
        
        <div class="notification-header-top">
            <span class="notif-title">Notifikasi</span>
            @if(isset($unreadNotificationsCount) && ($unreadNotificationsCount > 0 || count($groupedNotifications) > 0))
                <button id="clear-notif-btn" class="clear-btn">Clear All</button>
            @endif
        </div>

        <div class="notification-list-container" id="notification-list">
            
            @forelse($groupedNotifications as $groupName => $notifications)
                
                <div class="notification-group-header">
                    {{ $groupName }}
                </div>
                
                @foreach($notifications as $notification)
                  <a href="{{ $notification->data['url'] ?? '#' }}" class="notification-item">
                      
                      <div class="pic pic-sm" 
                           style="background-color: {{ $notification->data['creator_color'] ?? '#ccc' }};">
                           {{ $notification->data['creator_initials'] ?? '??' }}
                      </div>
                      
                      <div class="notification-content">
                          <p>
                              @if(isset($notification->data['creator_name']))
                                  <strong>{{ $notification->data['creator_name'] }}</strong> 
                                  
                                  @if(isset($notification->data['comment_body']))
                                      mengomentari <strong>{{ Str::limit($notification->data['task_title'], 20) }}</strong>: 
                                      "{{ Str::limit($notification->data['comment_body'], 20) }}"
                                  @else
                                      telah membuat task: <strong>{{ Str::limit($notification->data['task_title'], 25) }}</strong>
                                  @endif
                              @else
                                  {{ $notification->data['message'] }}
                              @endif
                          </p>
                          <small>{{ $notification->created_at->diffForHumans() }}</small>
                      </div>

                      @if(isset($notification->data['first_mockup_url']) && $notification->data['first_mockup_url'])
                          <img src="{{ $notification->data['first_mockup_url'] }}" class="notification-mockup">
                      @else
                          <div class="notification-mockup placeholder"></div>
                      @endif

                  </a>
                @endforeach

            @empty
              <div class="notification-empty">
                  <p>No notification yet!</p>
              </div>
            @endforelse
            
        </div> </div>

      <!-- Profile Dropdown -->
      <div class="profile-dropdown">
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
    <div class="sidebar-close-toggle" id="sidebar-close-btn">
        <i class="bi bi-x-lg"></i>
    </div>
  <div class="sidebar-menu">
      <div class="sidebar-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('dashboard') }}">
              <i class="bi bi-bar-chart-line-fill" style="margin-right: 8px;"></i>
              Dashboard
          </a>
      </div>

      <div class="sidebar-item {{ (request()->routeIs('task') || (request()->routeIs('task.show') && !request()->has('from'))) ? 'active' : '' }}">
        <a class="sidebar-cell" href="{{ route('task') }}">
            <i class="bi bi-list-task" style="margin-right: 8px;"></i>
            Task
        </a>
    </div>
      


    @if(Auth::user()->role == 'admin')
      <div class="sidebar-item {{ request()->routeIs('workline') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('workline') }}">
              <i class="bi bi-wrench-adjustable" style="margin-right: 8px;"></i>
              Line Pekerjaan
          </a>
      </div>
      {{-- <div class="sidebar-item {{ request()->routeIs('status') ? 'active' : '' }}">
          <a class="sidebar-cell" href="{{ route('status') }}">
              <i class="bi bi-arrow-repeat" style="margin-right: 8px;"></i>
              Status
          </a>
      </div> --}}
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
    <div class="sidebar-item {{ (request()->routeIs('archive') || (request()->routeIs('task.show') && request('from') == 'archive')) ? 'active' : '' }}">
    <a class="sidebar-cell" href="{{ route('archive') }}">
        <i class="bi bi-archive-fill" style="margin-right: 8px;"></i>
        Archive
    </a>
</div>
<div class="sidebar-item {{ (request()->routeIs('trash') || (request()->routeIs('task.show') && request('from') == 'trash')) ? 'active' : '' }}">
    <a class="sidebar-cell" href="{{ route('trash') }}">
        <i class="bi bi-trash-fill" style="margin-right: 8px;"></i>
        Trash
    </a>
</div>
      @endif
      {{-- <div class="setting">
        <a href=""><i class="bi bi-gear-wide-connected" style="margin-right: 8px;"></i>Setting</a>
    </div> --}}
  </div>

</div>
<div class="sidebar-toggle" id="sidebar-toggle-btn">
    <i class="bi bi-chevron-left"></i>
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
