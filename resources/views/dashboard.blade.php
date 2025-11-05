@extends('layouts.nav-side')

@section('title', 'Home Page')

@php
    use Illuminate\Support\Str;
    use Carbon\Carbon;
    // Definisikan $colors untuk PIC
    $colors = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c'];
@endphp
@section('content')
  <div class="page">
    <div class="dashboard">

      <div class="task-category">
        <div class="task-name">TO DO</div>
        <div class="task-clr" style="background-color:#3498db;">
          <div class="total-task">
            {{ $countToDo }}
          </div>
        </div>
      </div>

      <div class="task-category">
        <div class="task-name">ON PROGRESS</div>
        <div class="task-clr" style="background-color:#FD9F01;">
          <div class="total-task">
            {{ $countInProgress }}
          </div>
        </div>
      </div>

      <div class="task-category">
        <div class="task-name">COMPLETE</div>
        <div class="task-clr"  style="background-color:#076225;">
          <div class="total-task">
            {{ $countComplete }}
          </div>
        </div>
      </div>

 <div class="task-category">
        <div class="task-name">
         HOLD </div>
        <div class="task-clr"  style="background-color:#CF221B;"> <div class="total-task">
            {{ $countHold }} </div>
        </div>
      </div>
    </div>

    <div class="task-indash">
      <table class="data-table">
       <p class="table-tittle">Task Terbaru</p>
        <thead>
          <tr>
            <th>Task Tittle</th>
            <th>Status</th>
            <th>Time Left</th>
            <th>Line Pekerjaan</th>
          </tr>
        </thead>
        <tbody>
          @forelse($latestTasks as $task)
            @php
                $linePekerjaan = $task->taskPekerjaans->first();
                $deadline = $linePekerjaan ? $linePekerjaan->deadline : null;
            @endphp
            <tr>
                <td>{{ $task->judul }}</td>
                <td>
                    <span class="status-badge-sm status-{{ Str::slug($task->status->name) }}">
                        {{ $task->status->name }}
                    </span>
                </td>
                <td>
                    {{ $deadline ? Carbon::parse($deadline)->diffForHumans() : '-' }}
                </td>
                <td class="center-text">
                    {{ $linePekerjaan ? $linePekerjaan->nama_pekerjaan : 'N/A' }}
                </td>
            </tr>
          @empty
            <tr>
                <td colspan="4" class="text-center">Belum ada task baru.</td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>

    <div class="deadline">
      <table class="dldata-table">
        <p class="dltable-tittle">Deadline Terdekat</p>
         <thead>
           <tr>
             <th>Task Tittle</th>
             <th>Due Date</th>
             <th>Time left</th>
             <th>PIC</th>
           </tr>
         </thead>
         <tbody>
           @forelse($upcomingDeadlines as $task)
             @php
                // (Kita perlu ambil line pekerjaan lagi karena ini task yang berbeda)
                $linePekerjaan = $task->taskPekerjaans->firstWhere('deadline', '>=', now());
                $deadline = $linePekerjaan ? $linePekerjaan->deadline : null;

                // Logika Inisial & Warna PIC
                $picName = $task->user->name ?? 'A';
                $initials = \App\Http\Controllers\TaskController::buatInisial($picName);
                $bgColor = $colors[ord(strtoupper(substr($initials, 0, 1))) % count($colors)];
             @endphp
             <tr>
                 <td>{{ $task->judul }}</td>
                 <td>{{ $deadline ? Carbon::parse($deadline)->format('j-M-Y') : '-' }}</td>
                 <td>{{ $deadline ? Carbon::parse($deadline)->diffForHumans() : '-' }}</td>
                 <td class="pic-task">
                     <div class="pic-profile" style="background-color: {{ $bgColor }};">
                         {{ $initials }}
                     </div>
                 </td>
             </tr>
           @empty
             <tr>
                 <td colspan="4" class="text-center">Tidak ada deadline terdekat.</td>
             </tr>
           @endforelse
         </tbody>
       </table>
    </div>
  </div>
@endsection