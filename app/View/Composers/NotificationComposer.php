<?php

namespace App\View\Composers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;

class NotificationComposer
{
    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $recentNotifications = collect();
        $unreadCount = 0;

        if (Auth::check()) {
            // 1. Ambil 5 notifikasi TERBARU (sudah dibaca atau belum)
            $recentNotifications = Auth::user()->notifications()->latest()->take(5)->get();
            
            // 2. Ambil HANYA JUMLAH notifikasi yang BELUM DIBACA
            $unreadCount = Auth::user()->unreadNotifications->count();
        }

        // 3. Kirim KEDUA variabel ke view
        $view->with('recentNotifications', $recentNotifications);
        $view->with('unreadNotificationsCount', $unreadCount);
    }
}