<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\Task; 
use App\Models\User;

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
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->judul,
            'user_name' => auth()->user()->name, // User yang MEMBUAT task
            'message' => auth()->user()->name . ' telah membuat task baru: ' . $this->task->judul,

            'creator_name' => $this->creator->name,
            'creator_initials' => $this->creator->initials, // Panggil accessor
            'creator_color' => $this->creator->avatar_color, // Panggil accessor
        ];
    }
}