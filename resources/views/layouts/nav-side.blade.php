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
  <style>

  </style>
</head>
<body>

  <!-- navbar -->
<nav class="navbar">
  <div class="header-logo">
    <img src="assets/img/web-logo.png" alt="header logo">
</div>

  <!-- Notifikasi -->
<div class="navbarkanan">
    <i class="bi bi-bell-fill icon-kanan" id="bell-icon"></i>
    <div class="notification" id="notification">  
        <p>You have new notifications!</p>
    </div>

  <!-- Profile -->
  <div class="profile" id="profile">
    <i class="bi bi-person-fill icon-kanan" id="person-icon"></i>
  <div class="profile-inisial" id="initials">RW</div>
</div>

</div>
</nav>


<!-- Sidebar -->
   <div class="sidebar" id="sidebar">
    <div class="sidebar-menu">
      <div class="sidebar-item">
        <a class="sidebar-cell" href="#">
          <i class="bi bi-bar-chart-line-fill" style="margin-right: 8px;"></i>
          Dashboard</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-list-task" style="margin-right: 8px;"></i>
          Task</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-wrench-adjustable" style="margin-right: 8px;"></i>
          Line Pekerjaan</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-arrow-repeat" style="margin-right: 8px;"></i>
          Status</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-card-checklist" style="margin-right: 8px;"></i>
          Checklist</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-people-fill" style="margin-right: 8px;"></i>
          User</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-archive-fill" style="margin-right: 8px;"></i>
          Archive</a>
      </div>
      <div class="sidebar-item">
        <a class="sidebar-cell"href="#">
          <i class="bi bi-trash-fill" style="margin-right: 8px;"></i>
          Trash</a>
          <div class="setting">
            <a href=""><i class="bi bi-gear-wide-connected" style="margin-right: 8px;"></i>Setting
            </a>
        </div>
      </div>
      </div>
 </div>

 <!-- The Content -->
 <main>
    @yield('content') <!-- Konten dinamis -->
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script src="{{ asset('js/dash.js') }}"></script>
</body>
</html>
