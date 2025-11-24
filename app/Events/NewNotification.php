<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; 
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewNotification implements ShouldBroadcast // <--- PASTIKAN IMPLEMENTS INI
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $targetUserId; // ID User yang akan menerima notif

    public function __construct($message, $targetUserId)
    {
        $this->message = $message;
        $this->targetUserId = $targetUserId;
    }

    // Tentukan 'Saluran' (Channel) privat khusus untuk user tersebut
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->targetUserId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewNotification'; // Nama pendek yang kita inginkan
    }
}