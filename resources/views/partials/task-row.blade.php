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
    data-url="{{ route('task.show', $task->id) }}"
    {!! ($highlightId ?? null) == $task->id ? 'id="highlight-task"' : '' !!} >
    
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
        <div class="dropdown">
            <button class="status-btn status-{{ Str::slug($task->status->name) }} dropdown-toggle" 
                    type="button" 
                    id="statusDropdown{{ $task->id }}" 
                    data-task-id="{{ $task->id }}" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false" 
                    {{ Auth::user()->role != 'admin' ? 'disabled' : '' }}>
                <span class="status-text">{{ $task->status->name }}</span>
            </button>
            
            <div class="dropdown-menu" aria-labelledby="statusDropdown{{ $task->id }}">
                
                {{-- 1. MENU RESUME (Muncul jika status Hold ATAU Delivered) --}}
                @if($task->status->name == 'Hold' || $task->status->name == 'Delivered')
                    <a class="dropdown-item" href="#" data-status="Resume Progress">
                        <i class="bi bi-play-circle"></i> Resume Progress
                    </a>
                @endif

                {{-- 2. MENU HOLD (Muncul jika status BUKAN Hold) --}}
                @if($task->status->name != 'Hold')
                    <a class="dropdown-item" href="#" data-status="Hold">
                        <i class="bi bi-pause-circle"></i> Set to Hold
                    </a>
                @endif

                {{-- 3. MENU DELIVERED (Muncul jika status BUKAN Delivered) --}}
                @if($task->status->name != 'Delivered')
                    <a class="dropdown-item" href="#" data-status="Delivered">
                        <i class="bi bi-truck"></i> Set to Delivered
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
                $timeLeftString = 'Terkirim';
                $timeClass = 'time-delivered';
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
    
    <span id="time-left-{{ $task->id }}" class="{{ $timeClass }}" data-deadline="{{ $deadlineISO }}">
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
            // Tentukan warna progress secara manual di PHP agar langsung berwarna saat load
            $progressClass = 'status-yellow'; // Default (1-99%)
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
            <i class="bi bi-trash3-fill icon-trash" data-id="{{ $task->id }}"></i>
        @endif
    </td>
</tr>