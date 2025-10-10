@extends('layouts.nav-side')

@section('title', 'Home Page')

@section('content')
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
            <th>Time Left</th>
            <th>Line Pekerjaan</th>
          </tr>
        </thead>
        <tbody>

          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>3 Hari lagi</td>
            <td class="center-text">DTF</td>
          </tr>
          <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>3 Hari lagi</td>
            <td class="center-text">DTF</td>
          </tr>
            <tr>
            <td>Kaos SD SAIM</td>
            <td>To Do</td>
            <td>3 Hari lagi</td>
            <td class="center-text">DTF</td>
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

  @endsection


