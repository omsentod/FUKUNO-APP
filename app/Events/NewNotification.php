<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data; 
    public $targetUserId;

    public function __construct($data, $targetUserId)
    {
        $this->data = $data; 
        $this->targetUserId = $targetUserId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->targetUserId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewNotification';
    }
}