<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage; // <-- TAMBAHKAN BARIS INI

class CommentAdded extends Notification
{
    use Queueable;

    protected $comment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database']; 
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $creator = $this->comment->user;
        $task = $this->comment->task;

        // Baris ini sekarang akan berfungsi
        $firstMockup = $task->mockups()->first();
        $mockupUrl = $firstMockup ? Storage::url($firstMockup->file_path) : null;
        
        return [
            'task_id' => $task->id,
            'task_title' => $task->judul,
            'message' => $creator->name . ' mengomentari: ' . Str::limit($this->comment->body, 30),
            
            'creator_name' => $creator->name,
            'creator_initials' => $creator->initials,
            'creator_color' => $creator->avatar_color,
            
            'comment_body' => Str::limit($this->comment->body, 40),
            'url' => route('task.show', $task->id) . '#content-activity',
            'first_mockup_url' => $mockupUrl
        ];
    }
}