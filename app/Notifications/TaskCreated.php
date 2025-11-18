<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\Task; 
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class TaskCreated extends Notification
{
    use Queueable;

    protected $task; 
    protected $creator;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, User $creator)
    {
        $this->task = $task;
        $this->creator = $creator;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        // Kita hanya ingin menyimpannya di database
        return ['database']; 
    }

    /**
     * Get the array representation of the notification.
     * (Ini adalah data yang akan disimpan di DB)
     */
    public function toArray(object $notifiable): array
    {
        $firstMockup = $this->task->mockups()->first();
        $mockupUrl = $firstMockup ? Storage::url($firstMockup->file_path) : null;

        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->judul,
            'message' => $this->creator->name . ' telah membuat task: ' . $this->task->judul,
            'creator_name' => $this->creator->name,
            'creator_initials' => $this->creator->initials,
            'creator_color' => $this->creator->avatar_color,
            
            'url' => route('task', ['highlight' => $this->task->id]),
            'first_mockup_url' => $mockupUrl
        ];
    }
}