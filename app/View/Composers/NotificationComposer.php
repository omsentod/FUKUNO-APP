<?php

namespace App\View\Composers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon; 

class NotificationComposer
{
    public function compose(View $view): void
    {
        $unreadCount = 0;
        $groupedNotifications = collect(); // Koleksi kosong by default

        if (Auth::check()) {
            $user = Auth::user();
            
            // 2. Ambil HANYA JUMLAH yang belum dibaca
            $unreadCount = $user->unreadNotifications->count();
            
            // 3. Ambil 30 notifikasi TERBARU (terbaca/belum)
            $recentNotifications = $user->notifications()->latest()->take(30)->get();

            // 4. Logika Pengelompokan (Grouping)
            $groupedNotifications = $recentNotifications->groupBy(function($notification) {
                $date = $notification->created_at;
                
                if ($date->isToday()) {
                    return 'Hari Ini';
                }
                // (Carbon::setLocale('id') di AppServiceProvider harus ada)
                if ($date->isCurrentWeek()) {
                    return 'Minggu Ini';
                }
                if ($date->isCurrentMonth()) {
                    return 'Bulan Ini';
                }
                return 'Lebih Lama';
            });
        }

        // 5. Kirim data yang sudah dikelompokkan
        $view->with('groupedNotifications', $groupedNotifications);
        $view->with('unreadNotificationsCount', $unreadCount);
    }
}