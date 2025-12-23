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

    <div class="table-dashboard">
      <div class="task-indash">
        <table class="data-table">
         <p class="table-tittle">Task Terbaru</p>
          <thead>
            <tr>
              <th>Task Tittle</th>
              <th>Klien</th>
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
                  <td>{{ $task->nama_pelanggan }}</td>

                  
                  <td>
                    @php
                        $linePekerjaan = $task->taskPekerjaans->first();
                        $timeLeftString = '-';
                        $timeClass = ''; 
                        $deadlineISO = ''; 
    
                        // Tentukan apakah task sudah selesai
                        $allChecklists = $linePekerjaan ? $linePekerjaan->checklists : collect();
                        $total = $allChecklists->count();
                        $percentage = ($total > 0) ? round(($allChecklists->where('is_completed', true)->count() / $total) * 100) : 0;
                        $isDone = ($task->status->name == 'Done and Ready' || $percentage == 100);
    
                        if ($linePekerjaan && $linePekerjaan->deadline) {
                            $deadline = \Carbon\Carbon::parse($linePekerjaan->deadline);
                            $deadlineISO = $deadline->toIso8601String(); 
    
                            if ($isDone) {
                                $timeLeftString = $deadline->format('j M Y'); 
                                $timeClass = 'time-completed'; 
                            
                            } else {
                             
                                $rawTimeLeft = $deadline->diffForHumans();
                                
                                
                                $timeLeftString = str_replace('dari sekarang', 'lagi', $rawTimeLeft);
                                $timeLeftString = str_replace('sebelumnya', 'lalu', $timeLeftString); // (Untuk "5 jam lalu")
                               
    
                                if ($deadline->isPast()) {
                                    $timeClass = 'time-overdue'; 
                                }
                            }
                        }
                    @endphp
                    
                    <span id="time-left-{{ $task->id }}" class="{{ $timeClass }}" data-deadline="{{ $deadlineISO }}">
                        {{ $timeLeftString }}
                    </span>
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
               <th>Klien</th>
               <th>Time left</th>
               <th>Status</th>
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
                   <td>{{ $task->nama_pelanggan }}</td>
                   <td>
                    @php
                        $linePekerjaan = $task->taskPekerjaans->first();
                        $timeLeftString = '-';
                        $timeClass = ''; 
                        $deadlineISO = ''; 
    
                        // Tentukan apakah task sudah selesai
                        $allChecklists = $linePekerjaan ? $linePekerjaan->checklists : collect();
                        $total = $allChecklists->count();
                        $percentage = ($total > 0) ? round(($allChecklists->where('is_completed', true)->count() / $total) * 100) : 0;
                        $isDone = ($task->status->name == 'Done and Ready' || $percentage == 100);
    
                        if ($linePekerjaan && $linePekerjaan->deadline) {
                            $deadline = \Carbon\Carbon::parse($linePekerjaan->deadline);
                            $deadlineISO = $deadline->toIso8601String(); 
    
                            if ($isDone) {
                                $timeLeftString = $deadline->format('j M Y'); 
                                $timeClass = 'time-completed'; 
                            
                            } else {
                                // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
                                // 1. Ambil string mentah (e.g., "5 jam dari sekarang")
                                $rawTimeLeft = $deadline->diffForHumans();
                                
                                // 2. Ganti stringnya
                                $timeLeftString = str_replace('dari sekarang', 'lagi', $rawTimeLeft);
                                $timeLeftString = str_replace('sebelumnya', 'lalu', $timeLeftString); // (Untuk "5 jam lalu")
                                // ▲▲▲ AKHIR PERBAIKAN ▲▲▲
    
                                if ($deadline->isPast()) {
                                    $timeClass = 'time-overdue'; 
                                }
                            }
                        }
                    @endphp
                    
                    <span id="time-left-{{ $task->id }}" class="{{ $timeClass }}" data-deadline="{{ $deadlineISO }}">
                        {{ $timeLeftString }}
                    </span>
                </td>
                   <td>
                    <div class="dropdown">
                        <button class="status-btn status-{{ Str::slug($task->status->name) }} dropdown-toggle" type="button" id="statusDropdown{{ $task->id }}" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="status-text">{{ $task->status->name }}</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="statusDropdown{{ $task->id }}">
                            @if($task->status->name == 'Hold')
                                <a class="dropdown-item" href="#" data-status="Resume Progress"><i class="bi bi-play-circle"></i> Resume Progress</a>
                            @else
                                <a class="dropdown-item" href="#" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>
                            @endif
                        </div>
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
    
  </div>
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/dash.css') }}">
@endpush


