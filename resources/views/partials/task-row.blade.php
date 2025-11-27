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
    $isDone = ($task->status->name == 'Done and Ready' || $percentage == 100);
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
                @if($task->status->name == 'Hold')
                    <a class="dropdown-item" href="#" data-status="Resume Progress"><i class="bi bi-play-circle"></i> Resume Progress</a>
                @else
                    <a class="dropdown-item" href="#" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>
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

            if ($isDone) {
                $timeLeftString = 'Selesai';
                $timeClass = 'time-completed'; 
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
        <div class="dropdown">
            <button class="progress dropdown-toggle" type="button" id="progressDropdown{{ $task->id }}" data-task-id="{{ $task->id }}" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="progress-text">{{ $percentage }}%</span>
            </button>
            <div class="dropdown-menu p-3" aria-labelledby="progressDropdown{{ $task->id }}" style="width: 250px;">
                <form class="progress-form">
                    @forelse($allChecklists as $checklist)
                        <div class="form-check">
                            <input class="form-check-input progress-check" type="checkbox" 
                                   id="check-{{ $checklist->id }}" 
                                   data-id="{{ $checklist->id }}" 
                                   {{ $checklist->is_completed ? 'checked' : '' }}>
                            <label class="form-check-label" for="check-{{ $checklist->id }}">
                                {{ $checklist->nama_checklist }}
                            </label>
                        </div>
                    @empty
                        <p class="text-muted small">Belum ada checklist.</p>
                    @endforelse
                </form>
            </div>
        </div>
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