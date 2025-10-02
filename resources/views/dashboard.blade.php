{{-- <!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    @if(session('success'))
        <div style="color: green">{{ session('success') }}</div>
    @endif

    <h1>Halo, {{ Auth::user()->name }}!</h1>
    <p>Selamat datang di dashboard 🚀</p>

    <a href="{{ route('logout') }}">Logout</a>
</body>
</html> --}}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home/Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
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

<div class="navbarkanan">
  <i class="bi bi-bell-fill icon-kanan"></i>
  
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

  <!-- Konten utama -->
  <div class="page">
    <div class="dashboard">
      <div class="task-category">
        <div class="task-name">
          TO DO
        </div>
        <div class="task-clr" style="background-color:#3498db;">
          <div class="total-task">
            26
          </div>
        </div>
      </div>

      <div class="task-category">
        <div class="task-name">
         ON PROGRESS
        </div>
        <div class="task-clr" style="background-color:#FD9F01;">
          <div class="total-task">
            26
          </div>
        </div>
      </div>

      <div class="task-category">
        <div class="task-name">
        COMPLETE
        </div>
        <div class="task-clr"  style="background-color:#076225;">
          <div class="total-task">
            26
          </div>
        </div>
      </div>

      <div class="task-category">
        <div class="task-name">
         TRASHED
        </div>
        <div class="task-clr"  style="background-color:#CF221B;">
          <div class="total-task">
            26
          </div>
        </div>
      </div>
      <!-- pd -->
    </div>

    <!-- Task Hari ini -->
    <div class="task-indash">
      <table class="data-table">
       <p class="table-tittle">Task Hari Ini</p>
        <thead>
          <tr>
            <th>Task Tittle</th>
            <th>Status</th>
            <th>Created Ad</th>
            <th>PIC</th>
          </tr>
        </thead>
        <tbody>

          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>9-Dec-2025</td>
             <td class="pic-task"><div class="pic-profile">RW</div></td>
          </tr>
          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>9-Dec-2025</td>
             <td class="pic-task"><div class="pic-profile">RW</div></td>
          </tr>
          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>9-Dec-2025</td>
             <td class="pic-task"><div class="pic-profile">RW</div></td>
          </tr>
          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>9-Dec-2025</td>
             <td class="pic-task"><div class="pic-profile">RW</div></td>
          </tr>
          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>9-Dec-2025</td>
             <td class="pic-task"><div class="pic-profile">RW</div></td>
          </tr>
      
        </tbody>
      </table>
    </div>

      <!-- deadline -->
  <div class="deadline">
    <table class="dldata-table">
      <p class="dltable-tittle">Deadline</p>
       <thead>
         <tr>
           <th>Task Tittle</th>
           <th>Due Date</th>
           <th>Time left</th>
           <th>PIC</th>
         </tr>
       </thead>
       <tbody>

         <tr>
           <td>Kaos SD SAIM</td>
           <td>9-Dec-2025</td>
           <td>2 Hari Lagi</td>
            <td class="pic-task"><div class="pic-profile">RW</div></td>
         </tr>
         <tr>
          <td>Kaos SD SAIM</td>
          <td>9-Dec-2025</td>
          <td>2 Hari Lagi</td>
           <td class="pic-task"><div class="pic-profile">RW</div></td>
        </tr>
        <tr>
          <td>Kaos SD SAIM</td>
          <td>9-Dec-2025</td>
          <td>2 Hari Lagi</td>
           <td class="pic-task"><div class="pic-profile">RW</div></td>
        </tr>
        <tr>
          <td>Kaos SD SAIM</td>
          <td>9-Dec-2025</td>
          <td>2 Hari Lagi</td>
           <td class="pic-task"><div class="pic-profile">RW</div></td>
        </tr>
       </tbody>
     </table>
  </div>



  <!-- page main end -->
  </div>
  <!-- next -->



  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ asset('js/dash.js') }}"></script>
</body>
</html>
