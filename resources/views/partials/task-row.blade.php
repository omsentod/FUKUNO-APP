@php
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str;
    use Carbon\Carbon;
    use Illuminate\Support\Facades\Auth;

    // 1. Hitung Logika Progress & Status
    $linePekerjaan = $task->taskPekerjaans->first();
    $allChecklists = $linePekerjaan ? $linePekerjaan->checklists : collect();
    $completed = $allChecklists->where('is_completed', true)->count();
    $total = $allChecklists->count();
    $percentage = ($total > 0) ? round(($completed / $total) * 100) : 0;
    $isDone = ($task->status->name == 'Done and Ready' || $task->status->name == 'Delivered' || $percentage == 100);
@endphp

<tr class="clickable-row" 
    id="{{ ($highlightId ?? null) == $task->id ? 'highlight-task' : 'task-row-' . $task->id }}"
    
    data-url="{{ route('task.show', $task->id) }}">
    


    {{-- Kolom Checkbox (Hanya Admin) --}}
    @if(Auth::user()->role == 'admin')
        <td class="select-col">
            <input type="checkbox" class="row-checkbox" data-id="{{ $task->id }}">
        </td>
    @endif

    <td>{{ $task->no_invoice }}</td>
    <td>{{ $task->judul }}</td>
    <td>{{ $task->total_jumlah }}</td>

    <td>
        <button class="line-btn" style="background-color: #3498db; color: #ffff;">
            {{ $linePekerjaan ? $linePekerjaan->nama_pekerjaan : 'N/A' }}
        </button>
    </td>

    <td>{{ $task->urgensi }}</td>
    
   {{-- Kolom Status --}}
   <td>
    @php
        // Logika Tampilan Status Dinamis
        $currentStatus = $task->status->name;
        $statusSlug = Str::slug($currentStatus);

        // JIKA 100% DAN BUKAN DELIVERED -> PAKSA TAMPILAN 'DONE AND READY'
        if ($percentage == 100 && $currentStatus != 'Delivered') {
            $currentStatus = 'Done and Ready';
            $statusSlug = 'done-and-ready';
        }
    @endphp

    <div class="dropdown">
        {{-- Gunakan variabel $statusSlug dan $currentStatus yang baru --}}
        <button class="status-btn status-{{ $statusSlug }} dropdown-toggle" 
                type="button" 
                id="statusDropdown{{ $task->id }}" 
                data-task-id="{{ $task->id }}" 
                data-bs-toggle="dropdown" 
                aria-expanded="false">
            <span class="status-text">{{ $currentStatus }}</span>
        </button>
        
        <div class="dropdown-menu" aria-labelledby="statusDropdown{{ $task->id }}">
            @if(Auth::user()->role == 'admin')
                @if($currentStatus == 'Hold' || $currentStatus == 'Delivered')
                    <a class="dropdown-item" href="#" data-status="Resume Progress"><i class="bi bi-play-circle"></i> Resume Progress</a>
                @endif

                @if($currentStatus != 'Hold')
                    <a class="dropdown-item" href="#" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>
                @endif
            @endif

            @if($currentStatus != 'Delivered')
                <a class="dropdown-item" href="#" data-status="Delivered">
                    <i class="bi bi-check-circle"></i> Set to Delivered
                </a>
            @endif
        </div>
    </div>
</td>

    {{-- Kolom Time Left --}}
    <td>
        @php
        $timeLeftString = '-';
        $timeClass = ''; 
        $deadlineISO = $linePekerjaan && $linePekerjaan->deadline ? \Carbon\Carbon::parse($linePekerjaan->deadline)->toIso8601String() : '';

        $isFinished = ($task->status->name == 'Done and Ready' || $percentage == 100 || $task->status->name == 'Delivered');

        if ($isFinished) {
            if ($task->status->name == 'Delivered') {
                $dateObj = $task->completed_at ?? $task->updated_at ?? now();
                $timeLeftString = \Carbon\Carbon::parse($dateObj)->format('d M Y');   $timeClass = 'time-delivered';
            } else {
                $timeLeftString = 'Selesai';
                $timeClass = 'time-completed';
            }        
        } elseif ($linePekerjaan && $linePekerjaan->deadline) {
            $deadline = \Carbon\Carbon::parse($linePekerjaan->deadline);
            
            $rawTimeLeft = $deadline->diffForHumans();
            $timeLeftString = str_replace(['dari sekarang', 'sebelumnya'], ['lagi', 'lalu'], $rawTimeLeft);

            if ($deadline->isPast()) {
                $timeClass = 'time-late'; 
            } elseif ($deadline->lte(now()->addHours(49))) {
                $timeClass = 'time-mustdo'; 
            }
        }
    @endphp
    
    <span 
    id="time-left-{{ $task->id }}" 
    class="{{ $timeClass }}" 
    data-deadline="{{ $deadlineISO }}">
    {{ $timeLeftString }}
    </span>
    </td>

    {{-- Kolom Mockup --}}
    <td class="icon-cell">
        <div class="mockup-wrapper">
            @foreach($task->mockups as $mockup)
                <img src="{{ Storage::url($mockup->file_path) }}" class="mockup-image-data">
            @endforeach
            <img src="{{ $task->mockups->first() ? Storage::url($task->mockups->first()->file_path) : asset('assets/img/default.png') }}" class="mockup-display">
            <i class="bi bi-stack gallery-indicator {{ $task->mockups->count() > 1 ? 'visible' : '' }}"></i>
        </div>
    </td>
    
    {{-- Kolom Klien --}}
    <td>{{ $task->nama_pelanggan }}</td>
    
    {{-- Kolom Progress --}}
    <td>
        @php
            $progressClass = 'status-yellow'; 
            if ($percentage == 0) {
                $progressClass = 'status-red';
            } elseif ($percentage == 100) {
                $progressClass = 'status-green';
            }
        @endphp

        <button class="progress {{ $progressClass }}" 
                type="button" 
                style="cursor: default; pointer-events: none;"> <span class="progress-text">{{ $percentage }}%</span>
        </button>
    </td>
    
    {{-- Kolom Action --}}
    <td class="icon-cell">
        @if(Auth::user()->role == 'admin')
            <i class="bi bi-pencil-square icon-edit" data-id="{{ $task->id }}"></i>
        @endif
        <i class="bi bi-file-earmark-arrow-down icon-download" data-id="{{ $task->id }}"></i>
        @if(Auth::user()->role == 'admin')
        <i class="bi bi-files icon-duplicate" data-id="{{ $task->id }}"></i>
        @endif
    </td>
</tr>

